//authmiddleware.js
const jwt = require("jsonwebtoken");
// const config = require("./config");
function verifyToken(req, res, next) {
  // access  token through cookie
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, Process.env.SECRET_KEY); // Replace with your own JWT secret key
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
module.exports = verifyToken;
