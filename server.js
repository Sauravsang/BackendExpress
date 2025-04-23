
const express = require("express");

const cors = require("cors");

const connectDB = require("./database");

const User = require("./models/User");

const Course = require("./models/Course")

const upload = require ("./config/multer")

const sendMail= require('./config/nodemailerConfig')
const bcrypt = require('bcrypt')

const logger = require("./middleware/logger")

const errorHandler = require("./middleware/errorHandler")
const jwt = require('jsonwebtoken');
const authtoken = require("./middleware/authtoken")
const {authMiddleware,authorizeRole} = require("./middleware/authorization");
const verifyToken = require("./middleware/authtoken");



require('dotenv').config();

const app = express();

connectDB();

app.use(cors({
    origin: "http://localhost:3000",
    credential:true,
}))


app.use(express.json())
// ye line database me json formate to data parse(bhejne) karne me help kregi
// database me phle user insert krna

// for hasing any password we will user bcrypt.hash mathod .
// for matching a normal password with hashed password we will use bcrypt.compare method .
// bcrypt.hashed method
// we will need only two parameters if we have to hash any password.
//1. password. 2. saltRounds= A certified number at which a particular algorithm will be hitted

app.post('/add-course',authMiddleware,authorizeRole('Counsellor'),upload.single("banner"),async(req,res)=>{
    try {
        const {title,duration,description,category,discountPercentage,offerTillDate,startDate,endDate,isFeatured,createdBy}=req.body;
        const banner= req.file.path;
        const newCourse = new Course({title,duration,banner,description,category,discountPercentage,offerTillDate,startDate,endDate,isFeatured,createdBy});
        await newCourse.save();
        return res.status(200).json({message:"success in register course"});
        
    } catch (error) {
        return res.status(505).json({message:"error in course",error})
    }
  })

  app.get('/all-course',async(req,res)=>{
    try {
        // const{search,duration,category}=req.query;
        // let filters={}
        // if(search){
        //     filters.title={$regex:search,$options:"i"};
        // }
        // if(duration){
        //     filters.duration=duration;
        // }
        // if(category){
        //     filters.category={$regex:category,$options:"i"};
        // }
        const course = await Course.find();
          res.json(course)
    } catch (error) {
        req.status(502).json({message:"error in getting course",error});
    }
  })

app.use(errorHandler);
app.post("/register-user",logger, async (req,res,next)=>{
    try{
        const {name,email,password,contact,role}=req.body;
        //for saving this data
        const saltRounds=await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,saltRounds);
        console.log(hashedPassword);
        // const result = await bcrypt.compare(password,hashedPassword);
        // console.log("value of matched password is ",result);
        
        
        const otp = Math.floor(1000000+Math.random()*9000000).toString();
        const newUser= new User({name,email,password:hashedPassword,contact,otp,role});
        await newUser.save();
        const subject= "Welcom to uor platform your Otp for Varification"
        const text = `hi ${name}, thank you for registering at our platform, Your Otp is ${otp}, Please dont share it to anybody else.`

        const html = ` <h2>Thank you for Registering at our platform</h2>
        <p style={{color:'blue'}}>Your opt is : ${otp}<p/>
    <p style={{color:'red'}}>please your these otp for verification your account<p/>
    `;

    sendMail(email,subject,text,html);
        console.log("Data inserted successfully")
        return res.status(200).json({message:"Data is inserted successfully"});
        
    }catch(error){
        // console.log(error)
        // return res.status(500).json({massage:"internal server error"})
        next(error);

        
    }
})

// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbmluZ3dhbjMxOEBnbWFpbC5jb20iLCJpYXQiOjE3NDM2ODMwNzksImV4cCI6MTc0MzY4NjY3OX0.bPu8mHETQGu3KRuGBj3aNta1lZM5yQwykXJOaZuSFUM"

app.get("/alluser",authMiddleware,authorizeRole("Counsellor"),async (req, res)=>{
    try{
        const users=await User.find();
        return res.json(users);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"An error occurred"});
        
    }
})

app.put("/users/:id",async(req,res)=>{
    try{
        const{name,email,password,contact}=req.body;
        const UpdatedUser= await User.findByIdAndUpdate(req.params.id,{name,email,password,contact},
            {new:true});
            if(!UpdatedUser){
                return res.status(404).json({message:"user not found"});
            }
        res.json(UpdatedUser);
    }catch(error){
        return res.status(200).json({message:"An error is occured"});
    }
})
app.delete("/users/:id",async(req, res)=>
{try{
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if(!deletedUser){
        return res.status(400).json({message:"User not found"});
    }
    res.json(deletedUser);
}catch(error){
    return res.status(500).json({message:"An error occured"})
}
});

app.post('/login',logger, async (req,res)=>{
    try {
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(403).json({message:"user not existing..."});
        }
        const res1 = await bcrypt.compare(password,user.password) // it returns bollean value...
        if(!res1){
            return res.status(404).json({message:'password is not matched...'});
        }

        const token = jwt.sign({ email : user.email},process.env.JWT_SECRET,{expiresIn:"1h"});

        return res.status(200).json({message:'login successfully...',token})
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({message:'error in login'})
    }
  });


app.post('/verify', async (req,res)=>{
    try {
        const {email,otp} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message:'user not found...'});
        }
        if(otp===user.otp){
            return res.status(202).json({message:'otp verification success...'});
        }
        else{
            return res.status(405).json({message:'otp not matched...'})
        }
    } catch (error) {
        return res.status(503).json({message:'error in verify otp...'})
    }
  });

  app.patch("/edit", async (req, res) => {
    try {
      const { title } = req.body;
      const user = await User.findOne({ title });
      if (!user) {
        return res.status(403).json({ message: "id not find" });
      }
      const updatetitle = await course.updateOne(
        { title },
        { title: "WEB-@-DEV" }
      );
      return res.status(200).json({ message: "successfully update " });
    } catch (error) {
      return res.status(500).json({ message: "error in editing"});
  }
  });


app.listen(5000,()=>{
    console.log("server is running on localhost:5000");
    
})

