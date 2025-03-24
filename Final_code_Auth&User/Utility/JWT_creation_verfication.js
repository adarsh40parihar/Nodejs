const jwt = require("jsonwebtoken");
const util = require("util");
const promisify = util.promisify;
const promisdiedJWTsign = promisify(jwt.sign);
const promisdiedJWTverify = promisify(jwt.verify);

// token creation:

const tokenCreation = async (req, res, id) => {
  //token create
  const authToken = await promisdiedJWTsign(
    { id: id },
    process.env.JWT_SECRET_KEY
  );
  // token -> cookie
  res.cookie("jwt", authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30, //age => 30 days
    httpOnly: true, // it can only be accessed by the server
  });
};

// token verification
const tokenVerificaton = async function (authToken) {
  try {
    if (authToken) {
      const unlockToken = await promisdiedJWTverify(
        authToken,
        process.env.JWT_SECRET_KEY
      );
      return unlockToken;
    } else {
      return { error: "No JWT token found", status: 400 };
    }
  } catch (err) {
    return { error: "Invalid JWT token", status: 401 };
  }
};

module.exports = {
  tokenCreation: tokenCreation,
  tokenVerificaton: tokenVerificaton,
};
