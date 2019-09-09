const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req,res,next) {
    const token = req.header('x-auth-token');

    // Check if not token
    if(!token) {
        return res.json({msg : "Login expired"});
    }

    //Verify token
    try {
     
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        
        req.id = decoded.id;
        req.role = decoded.role;
        next();
    } catch (error) {
        res.status(401).json({msg : "Token not valid" });
    }

    
};