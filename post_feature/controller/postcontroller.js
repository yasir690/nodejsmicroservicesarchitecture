const prisma = require("../config/prismaConfig");
const axios = require('axios');
const amqp = require('amqplib');
const addpost=async(req,res)=>{
    try {
        const {title,description,user_id}=req.body;
        // const {user_id}=req.user;
        const post=await prisma.post.create({
            data:{
                title,
                description,
                user_id:user_id
            }
        })

        if(!post){
            return res.status(400).json({
                success:false,
                message:"post not save"
            })
        }

        return res.status(200).json({
            success:true,
            message:"post save successfully",
            data:post
        })


    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


// const getpost=async(req,res)=>{
//     try {
//         const {user_id}=req.user;
//         const posts=await prisma.post.findFirst({
//           where:{
//             user_id:user_id
//           }
          
//         });

//         if(!posts){
//             return res.status(400).json({
//                 success:false,
//                 message:"posts not found"
//             })
//         }

//  // Step 2: Fetch user information from the Auth service

//  const userResponse = await axios.get(`http://localhost:4000/api/v1/userDetail/${user_id}`);

//  if (!userResponse.data) {
//     return res.status(404).json({ message: 'User not found' });
//   }

//   const user = userResponse.data;

//   const postWithUser = {
//     ...posts,
//     user: user,
//   };

      

    
//         return res.status(200).json({
//             success:true,
//             message:"posts found successfully",
//             data:postWithUser
//         })
//     } catch (error) {
//         return res.status(500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }


async function connectRabbitMQ() {
    const connection = await amqp.connect('amqps://pthlflcr:jskrT_kI4Q153sKMR-2HuAfmZJUqaq1l@puffin.rmq2.cloudamqp.com/pthlflcr');
    const channel = await connection.createChannel();
    const queue = 'userDetailQueue'; // The queue we're sending the request to
  
    await channel.assertQueue(queue, {
      durable: false,
    });
  
    return channel;
  }
  
  const getpost = async (req, res) => {
    try {
    //   const { user_id } = req.user;
    const {user_id}=req.params;
      const posts = await prisma.post.findFirst({
        where: {
          user_id: user_id,
        },
      });
  
      if (!posts) {
        return res.status(400).json({
          success: false,
          message: 'Posts not found',
        });
      }
  
      const channel = await connectRabbitMQ();
      const queue = 'userDetailQueue'; // The queue we're sending the request to
      const replyQueue = 'responseQueue'; // Queue for receiving the response from the consumer
  
      // Create a temporary unique correlation ID for the response
      const correlationId = generateUniqueId(); // You can use `uuid` or similar to generate a unique ID
  
      // Send a message to RabbitMQ to get user details
      channel.sendToQueue(queue, Buffer.from(user_id), {
        replyTo: replyQueue, // Specify where the response should be sent
        correlationId: correlationId, // Attach the correlation ID for tracking
      });
  
      // Listen for a response from the consumer
      channel.assertQueue(replyQueue, { durable: false });
  
      // Set a timeout for waiting for the response (e.g., 10 seconds)
      const timeout = setTimeout(() => {
        return res.status(504).json({
          success: false,
          message: 'Timeout waiting for user data',
        });
      }, 10000); // 10 seconds timeout
  
      channel.consume(replyQueue, (msg) => {
        if (msg.properties.correlationId === correlationId) {
          clearTimeout(timeout); // Clear the timeout if we get the response in time
          const user = JSON.parse(msg.content.toString());
  
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
  
          const postWithUser = {
            ...posts,
            user: user,
          };
  
          return res.status(200).json({
            success: true,
            message: 'Posts found successfully',
            data: postWithUser,
          });
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
  // Helper function to generate a unique correlation ID (you can use uuid or other method)
  function generateUniqueId() {
    return Math.random().toString(36).substring(2);
  }
  

module.exports={
    addpost,
    getpost
}