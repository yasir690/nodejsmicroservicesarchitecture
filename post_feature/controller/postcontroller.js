const prisma = require("../config/prismaConfig");
const axios = require('axios');
const addpost=async(req,res)=>{
    try {
        const {title,description}=req.body;
        const {user_id}=req.user;
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

const getpost=async(req,res)=>{
    try {
        const {user_id}=req.user;
        const posts=await prisma.post.findFirst({
          where:{
            user_id:user_id
          }
          
        });

        if(!posts){
            return res.status(400).json({
                success:false,
                message:"posts not found"
            })
        }

 // Step 2: Fetch user information from the Auth service

 const userResponse = await axios.get(`http://localhost:4000/api/v1/userDetail/${user_id}`);

 if (!userResponse.data) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = userResponse.data;

  const postWithUser = {
    ...posts,
    user: user,
  };

      

    
        return res.status(200).json({
            success:true,
            message:"posts found successfully",
            data:postWithUser
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


module.exports={
    addpost,
    getpost
}