const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Nemate pristup ovom dijelu FoodSprint platforme" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Nemate pristup ovom dijelu FoodSprint platforme" });
    req.user = decoded.UserInfo.username;
    req.roles = decoded.UserInfo.roles;
    req.userId = decoded.UserInfo._id;
    next();
  });
};

module.exports = verifyJWT;
