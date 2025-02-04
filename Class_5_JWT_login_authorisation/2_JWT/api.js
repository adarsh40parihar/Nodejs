const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const jwt = require("jsonwebtoken");

const util = require("util");
const promisify = util.promisify;

const promisdiedJWTsign = promisify(jwt.sign);
const promisdiedJWTverify = promisify(jwt.verify);

app.use(cookieParser());


const SECRET_KEY = "abraacdbra";
// tiken creation:
app.get('/sign', async function(req, res) {

  //token create
  const authToken = await promisdiedJWTsign({ "payload": "sdjhbfsdjhb" }, SECRET_KEY);
  // token -> cookie 
  console.log(authToken);
  res.cookie("jwt", authToken, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true, // it can only be accessed by the server
  });
  //res send
  res.status(200).json({
    message: "Signed the jwt and sending it in the cookie",
  });
  
})

// token verification
app.get('/verify', async function (req, res) {
  if (req.cookies && req.cookies.jwt) {
    const authToken = req.cookies.jwt;
    const unlockToken = await promisdiedJWTverify(authToken, "SECRET_KEY");
    res.status(200).json({
      message: "Verified the JWT token and it matches the signed one",
      payload: unlockToken,
    })

  }
  else {
    res.status(400).json({
      message: "No JWT token found",
    })
  }
});


const port = 3000;
app.listen(port, function () {
  console.log(`Server is running at port ${port}`);
});
