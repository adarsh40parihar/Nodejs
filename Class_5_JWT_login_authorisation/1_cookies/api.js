const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
// app.use(cookieParser());



app.get('/', function (req, res) {
    console.log("Get request received");
    res.cookie("prevpage", "home", {
        maxAge: 1000* 60 * 60 * 24,
    })
    res.status(200).json({
      message: "received request on  home page",
    });
})

app.get("/product", function (req, res) {
  let messageStr = "";
  if (req.cookies && req.cookies.prevpage) {
    messageStr = `You visited ${req.cookies.prevpage} page before`;
  }
  else {
    messageStr = "No previous page found";
  }
  res.status(200).json({
    message: messageStr,
  });
})

app.get("/clearCookies", function (req, res) {
  res.clearCookie("prevpage",{path: "/"});  //path were cookie was set before
  res.status(200).json({
    message: "Cookies cleared successfully",
  });
})


const port = 3000;
app.listen(port, function () {
    console.log(`Server is running at port ${port}`);
});
