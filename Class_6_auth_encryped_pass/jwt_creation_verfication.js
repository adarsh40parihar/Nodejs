
const jwt = require("jsonwebtoken");
const util = require("util");
const promisify = util.promisify;
const promisdiedJWTsign = promisify(jwt.sign);
const promisdiedJWTverify = promisify(jwt.verify);
const dotenv = require("dotenv");
dotenv.config({ path: "./Class_6_auth_mvc/.env" }); 

// token creation:

const tokenCreation = async (req, res, id) => {
  //token create
  const authToken = await promisdiedJWTsign({ id:id }, process.env.SECRET_KEY);
  // token -> cookie
  res.cookie("jwt", authToken, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true, // it can only be accessed by the server
  });
};

// token verification
const tokenVerificaton = async function (req, res) {
  try {
    if (req.cookies && req.cookies.jwt) {
      const authToken = req.cookies.jwt;
      const unlockToken = await promisdiedJWTverify(authToken, process.env.SECRET_KEY);
      return unlockToken;
    } else {
      res.status(400).json({
        message: "No JWT token found",
      });
    }
  } catch (err) {
    res.status(401).json({
      message: "Invalid JWT token",
      error: err,
    });
  }
};

module.exports = {
    tokenCreation: tokenCreation,
    tokenVerificaton: tokenVerificaton,
}
