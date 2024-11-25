const express=require('express');
const bodyParser = require("body-parser");
const dbConnect = require('./connectivity');
const authRouters = require('./router/authrouter');
require('dotenv').config();
const app=express();
const port=process.env.PORT;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(process.env.API_PRIFEX,authRouters)

// Database connection
dbConnect().catch((err) => {
    console.error("Database connection failed:", err);
    throw new Error("Database connection failed");
  });
  

app.get('/',(req,res)=>{
    res.send('hello world')
})

app.listen(port,()=>{
    console.log(`server is running at ${port}`);    
})