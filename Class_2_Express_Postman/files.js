const fs = require("fs");
const content = fs.readFileSync("posts.json");
console.log("content in hexadeciaml",content);

//utf-8 is stands for string
const content1 = fs.readFileSync("posts.json", "utf-8");
console.log("content in string",content1);


//Converts a JavaScript Object Notation (JSON) string into an object.
const jsonPosts = JSON.parse(content1)
console.log("content in human readable(json format)", jsonPosts);