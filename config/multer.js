const multer= require("multer");
const {CloudinaryStorage}=require("multer-storage-cloudinary");
const cloudinary=require("./cloudinary");

const storage= new CloudinaryStorage({
    cloudinary, 
    params:{
        folder:"kodu-coures",
        allowed_formats:["jpg","png","jpeg","svg","gif"]}
})

const upload = multer({storage});

module.exports=upload;