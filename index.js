const { compareSync } = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const userRoute = require("./routes/userRoute")
const PORT=3000;

mongoose.connect("mongodb://localhost:27017/user_management").then(
    console.log(" succesfully connected to db ")
).catch(err=>{
    console.err("Error connecting to DB:",err);
});

const app = express();
app.use(express.json());
app.use("/",userRoute);
app.listen(PORT,()=>{
    console.log(`server is listening on port ${PORT}`);
})

