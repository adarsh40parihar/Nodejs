const express = require("express");

const app = express();

function beforeFn(req,res,next){
    console.log("Before fun Called");
    const length = Object.keys(req.body).length;
    if(length > 0 && req.body.Name &&  req.body.UserId){
        const fullNameNamArr = req.body.Name.split(" ");
        req.body.firstName = fullNameNamArr[0];
        if (fullNameNamArr[2] !== undefined) {
            req.body.middleName = fullNameNamArr[1];
            req.body.lastName = fullNameNamArr[2];
        }
        else req.body.lastName = fullNameNamArr[1];
        
        next();
    } 
    else{
        console.log("res");
        res.status(400).json({
            message: "bad request"
        })
    }
    next();
}
function afterFn(req,res){
    console.log("after fun called");
    console.log("req.body :", req.body);
    res.status(200).json({
    message: "response recived to frontend",
    body: req.body,
    });
}
app.use(express.json());
app.post("/posts",beforeFn);
app.post("/posts",afterFn);
app.use(function(req,res){
    res.status(404).json({
    message: "404 page not found."
})
})

app.listen(3000, function(){
    console.log("Server is running at 3000 port.")
})