const authModel = require("../model/authmodel");
const bcrypt=require('bcrypt');
const jwt = require("jsonwebtoken");
const amqp = require('amqplib');

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


 
  // const userDetail = async (req, res) => {
  //   try {
  //     const {user_id}=req.params;

    
  //     const user = await authModel
  //       .findOne({ _id: user_id })  
  //     if (!user) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "user not found",
  //       });
  //     }
  
      
  //     return res.status(200).json({
  //       success: true,
  //       message: "User Login Successfully",
  //       data: user,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: "Internal server error",
  //     });
  //   }
  // };

  async function connectRabbitMQ() {
    const connection = await amqp.connect('amqps://pthlflcr:jskrT_kI4Q153sKMR-2HuAfmZJUqaq1l@puffin.rmq2.cloudamqp.com/pthlflcr');
    const channel = await connection.createChannel();
    const queue = 'userDetailQueue'; // Define a queue for user detail requests
  
    await channel.assertQueue(queue, {
      durable: false,
    });
  
    console.log('Waiting for messages in queue:', queue);
  
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const user_id = msg.content.toString(); // The user_id sent by the producer
  
        try {
          // Fetch the user details from your database
          const user = await authModel.findOne({ _id: user_id });
  
          if (user) {
            // Send the user detail response back (you could also publish to another queue or use HTTP)
            console.log('User details fetched for:', user_id);
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(user)), {
              correlationId: msg.properties.correlationId, // Attach the correlation ID
            });
          } else {
            console.log('User not found:', user_id);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
  
        channel.ack(msg); // Acknowledge the message
      }
    });
  }
  
  connectRabbitMQ().catch(console.error);

  
  module.exports={
    userRegister,
    userLogin,
    // userDetail
  }