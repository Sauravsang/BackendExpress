
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next)=> {
    const token = req.headers['authorization']?.split(' ')[1];

    if(!token) {
        return res.status(403).json({ message: "A token is required for authentication"});
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        
        return res.status(401).json({ message: "invalid token"});
    }
};

module.exports = verifyToken