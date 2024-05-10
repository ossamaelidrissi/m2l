const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (authHeader) {

      const token = authHeader.split(" ")[1];

      jwt.verify(token,process.env.JWT_SECRET,(err,user) => {
          if (err) {                             
            console.log("🚀 ~ jwt.verify ~ err:", err)
            res.status(403).json("Token Invalid!");
            return;
          }
          
          req.user = user;

          next()
      });
    }else{
        res.status(401).send("Should Login First !");
    }


    // if (req.session.user && req.session.user.fonction === "admin") {
    //   return next();
    // } else {
    //   return res.status(403).send({ success: false, message: "Accès non autorisé" });
    // }
  }

  function isAdmin(req,res,next) {
    verifyToken(req,res,() => {
      console.log("🚀 ~ verifyToken ~ req.user:", req.user)
      if(req.user.fonction == "admin") {
        return next();
      } else {
        return res.status(403).send({ success: false, message: "Accès non autorisé" });
      }
    })
  }
  
  module.exports = {
    verifyToken,
    isAdmin
  };
  