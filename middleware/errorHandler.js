function errorHandler(err,req,res,next){
    console.log(err);
    const statusCode=err.statusCode || 500;
    const message =err.message || "Internal SErver Error";
    res.status(statusCode).json(message);
    console.log("hello");
    

    
}

module.exports = errorHandler;