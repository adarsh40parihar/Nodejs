const express  = require("express");
const fs = require("fs");
const path = require("path")
const  app = express();

const content = fs.readFileSync("posts.json","utf-8");
const jsonPosts = JSON.parse(content);

//----------------server start----------------//
const  port = 3000;
app.listen(port,function(){
    console.log(`server is running at ${port} port.............`)
})


//-----------------get request----------------------//

function getHandler(req,res){
  console.log("Recieved get req");
  /*
    const postdata = {
        "id": 1,
        "title": "His mother had always taught him",
        "body": "His mother had always taught him not to ever think of himself as better than others. He'd tried to live by this motto. He never looked down on those who were less fortunate or who had less money than him. But the stupidity of the group of people he was talking to made him change his mind.",
        "tags": [
            "history",
            "american",
            "crime"
        ],
        "reactions": {
            "likes": 192,
            "dislikes": 25
        },
        "views": 305,
        "userId": 121
    }*/
  res.status(200).json(postdata);
}

function getPostByID(req,res){
    try{
        const postID = req.params.postID;
        console.log("postID=",postID);
        const postsArr = jsonPosts.posts;
        for(let i=0;i<postsArr.length;i++){
            if(postID == postsArr[i].id){
                res.status(200).json({
                    post: postsArr[i]
                });
                return;
            }
        }
        res.status(404).json({
            post: "Not found"
        })
        
    }catch (err) {
        res.status(500).json({
            response: "something went wrong on our end"
        })
    }
}

function createPostfromID(req,res){
    try{
        console.log("req.body", req.body);
        jsonPosts.posts.push(req.body);
        const directoryPath = path.dirname(__filename);
        const postfilepath = path.join(directoryPath,"posts.json")
        fs.writeFileSync(postfilepath,JSON.stringify(jsonPosts,null,2));
        res.status(201).json({
            body: req.body,
            response: "Successfully posted"
        })

    }
    catch(err){
       res.status(500).json({
            response: "something went wrong on our end"
            })
    }

} 

function updatePostByID(req, res) {
        try {
          console.log("req.body", req.body.id);
          const postArr = jsonPosts.posts;
          let postFound = false;
          for (let i = 0; i < postArr.length; i++) {
            if (req.body.id == postArr[i].id) {
              jsonPosts.posts[i] = req.body;
              postFound = true;
              break;
            }
          }
          if (!postFound) {
            return res.status(404).json({ response: "Post not found" });
          }

          const directoryPath = path.dirname(__filename);
          const postfilepath = path.join(directoryPath, "posts.json");
            
          fs.writeFileSync(
            postfilepath,
            JSON.stringify(jsonPosts, null, 2),
            "utf8"
          ); // Ensure correct encoding

          res.status(200).json({
            body: req.body,
            response: "Successfully updated",
          });
        } catch (err) {
          res.status(500).json({
            response: "something went wrong on our end",
          });
        }
}

function deletePostByID(req, res) {
  try {
    const postId = req.params.postID;

    // Guard against undefined/null postId
    if (!postId) {
      return res.status(400).json({ response: "Post ID is required" });
    }

    // Find post index using array method instead of manual loop
    const index = jsonPosts.posts.findIndex((post) => post.id == postId);

    if (index === -1) {
      return res.status(404).json({ response: "Post not found" });
    }

    // Remove post
    jsonPosts.posts.splice(index, 1);

    // Write updated data to file
    const postFilePath = path.join(__dirname, "posts.json");
    fs.writeFileSync(postFilePath, JSON.stringify(jsonPosts, null, 2), "utf8");

    res.status(200).json({
      response: "Post Deleted Successfully",
    });
  } catch (err) {
    console.error("Error in deleting post:", err.message);
    res.status(500).json({
      response: "Something went wrong on our end",
      error: err.message, // Including error message in development
    });
  }
}


app.use(express.json());
app.post("/posts/",createPostfromID);
app.get("/posts/:postID", getPostByID);
app.patch("/posts/", updatePostByID);
app.delete("/posts/:postID", deletePostByID);


