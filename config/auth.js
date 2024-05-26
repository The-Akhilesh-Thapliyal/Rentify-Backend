const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized Access No Token"
            })
        }
        else {
            const validate = jwt.verify(token, "Hello");
            if (!validate) {
                return res.status(401).json({
                    message: "Unauthorized Access Invalid Token"
                })
            }
            req.user = validate.user_email;
            req.user_role = validate.role;
            req.token = token;
            console.log("Token Verified");
            // console.log(req.user);
            // console.log(req.user_role);
            next();
        }

    }
    catch(error){
        res.status(500).json({ message: "Error Occured While Verifying Token", error: error.message,status:0 });
    }

}

module.exports = {verifyToken};
