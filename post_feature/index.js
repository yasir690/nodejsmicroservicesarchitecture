const express=require('express');
const bodyParser = require("body-parser");
const postRouters = require('./router/postrouter');
require('dotenv').config();
const app=express();
const port=process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use(process.env.API_PRIFEX,postRouters)


app.get('/',(req,res)=>{
    res.send('hello world')
})

app.listen(port,()=>{
    console.log(`server is running at ${port}`);
    
})