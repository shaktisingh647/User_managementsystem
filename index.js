const { compareSync } = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const userRoute = require("./routes/userRoute")
const config = require("./config/config")

mongoose.connect(config.MONGO_URL).then(
    console.log(" succesfully connected to db ")
).catch(err=>{
    console.err("Error connecting to DB:",err);
});

const app = express();
app.use(express.json());
app.use("/",userRoute);
app.listen(config.PORT || 8088,()=>{
    console.log(`server is listening on port ${config.PORT || 8088}`);
})

