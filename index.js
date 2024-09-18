const { compareSync } = require('bcryptjs');
const express = require('express');
const mongoose = require('mongoose');
const userRoute = require("./routes/userRoute")
const config = require("./config/config")

mongoose.connect("mongodb://localhost:27017/user_management").then(
    console.log(" succesfully connected to db ")
).catch(err=>{
    console.log("Error connecting to DB:",err);
});

const app = express();
app.use(express.json());
app.use("/",userRoute);
app.listen(config.PORT || 8088,()=>{
    console.log(`server is listening on port ${config.PORT || 8088}`);
})

