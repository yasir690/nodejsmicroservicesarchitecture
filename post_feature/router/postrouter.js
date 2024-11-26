const express = require('express');
const postController = require('../controller/postcontroller'); // Importing controller without the .js extension
const auth = require('../middleware/auth');


// Create a router instance
const postRouters = express.Router();

// User register route
postRouters.post("/addpost",auth, postController.addpost);

// User login route
postRouters.get("/getpost/:user_id", postController.getpost);


module.exports=postRouters;