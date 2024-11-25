const authModel = require("../model/authmodel");
const bcrypt=require('bcrypt');
const jwt = require("jsonwebtoken");

  const userRegister = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "provide name",
        });
      }
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "provide email",
        });
      }
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "provide password",
        });
      }
  
      // Check if the user exists in the database
      const userCheck = await authModel.find({ email: email });
  
      if (userCheck.length !== 0) {
        return res.status(200).json({
          message: "user email already exists",
          success: false,
        });
      }
  
      // Create user
      const user = new authModel({
        name,
        email,
        password: bcrypt.hashSync(password, 10),
      });
  
      const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
        expiresIn: "1d",
      });
  
      // Save user token
      user.userToken = token;
  
      // Save user to the database
      const saveUser = await user.save();
  
      if (!saveUser) {
        return res.status(400).json({
          success: false,
          message: "user not created",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "user created successfully",
        data: saveUser,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };


  const userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email not provided",
        });
      }
  
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password not provided",
        });
      }
  
      const user = await authModel
        .findOne({ email: email })  
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "user not found",
        });
      }
  
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({
          success: false,
          message: "Please enter the correct password",
        });
      }
  
      const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
        expiresIn: "1d",
      });
  
      user.userToken = token;
      await user.save();
  
      const profile = { ...user._doc, userToken: token };
  
      return res.status(200).json({
        success: true,
        message: "User Login Successfully",
        data: profile,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  const userDetail = async (req, res) => {
    try {
      const {user_id}=req.params;

    
      const user = await authModel
        .findOne({ _id: user_id })  
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "user not found",
        });
      }
  
      
      return res.status(200).json({
        success: true,
        message: "User Login Successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  
  module.exports={
    userRegister,
    userLogin,
    userDetail
  }