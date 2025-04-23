const logger = (req, res, next)=>{
    console.log(`Request Method : ${req.method}`);
    console.log(`request URL : ${req.url}`);
    next();
    
}


module.exports=logger;
