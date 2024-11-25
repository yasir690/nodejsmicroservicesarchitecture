const express = require('express');
const authController = require('../controller/authcontroller'); // Importing controller without the .js extension
const auth = require('../middleware/auth');


// Create a router instance
const authRouters = express.Router();

// User register route
authRouters.post("/userRegister", authController.userRegister);

// User login route
authRouters.post("/userLogin", authController.userLogin);

authRouters.get("/userDetail/:user_id", authController.userDetail);


module.exports=authRouters;