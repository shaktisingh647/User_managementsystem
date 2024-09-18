const bcrypt = require('bcryptjs');
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const randomstring = require('randomstring');
const config = require("../config/config")
const securePassword = async(password)=>{
    try{
     const passwordHash = await bcrypt.hash(password,10);
     return passwordHash;
    }catch(err){
        console.log(err.message);
    }
}
const loadRegister = async(req,res)=>{
    try{
        res.render('registration');
    }catch(err){
        console.log(err.message);
    }
}

//  for sending mail
 const sendVerifyMail =async (name,email,user_id)=>{
 try{
    const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Port for TLS
    secure: false, // Set to false for TLS (true for SSL)
    requireTLS:true,
    auth: {
        user: config.emailUser, //  Gmail address
        pass: config.emailPassword     // The app password generated from Google
    }

     });

     const mailOptions = {
        from:config.emailUser,
        to:email,
        subject:'For verification mail',
        html: '<p>Hii ' + name + ', Click here to <a href="http://localhost:3000/register/verify?id=' + user_id + '">Verify</a> your mail </p>'

     }

     transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error);
        }else{
            console.log("Email has been sent",info.response);
        }
     })
 }catch(err){
    console.log(err.message);
 }
 }

const newUser = async (req,res)=>{
    try{
        const spassword = await securePassword(req.body.password);
        const user = new User ({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            image:req.file.filename,
            password:spassword,
            is_admin:0,

        });
        const userData = await user.save();

        if(userData){
            sendVerifyMail(req.body.name,req.body.email,userData._id);
            res.render('registration',{message:"Your registration has been succesfull , Please verify your mail"});
        }else{
            res.render('registration',{message:"Unable to create new user"});
        }
    }catch(err){
        console.log(err.message);
    }
}

const verifyMail = async(req,res)=>{
    try{
        const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1}});
        console.log(updateInfo);
        // email-verified is a ejs view
        res.render("email-verified");
    }catch(err){
        console.log(err.message);
    }
}

// login user
const login = async(req,res)=>{
    try{
       res.render('login');
    }catch(error){
       console.log(error.message); 
    }
}
//   verifying user
 const verifyLogin = async (req,res)=>{
    try{
      const email = req.body.email;
      const password = req.body.password;
      const userData = await User.findOne({email:email});
      if(userData){
       const passwordMatch = await bcrypt.compare(password,userData.password);
       if(passwordMatch){
        if(userData.is_verified===0){
        res.render('login',{message:"Please verify your mail"});
        }else{
            req.session.user_id = userData._id;
         res.redirect('home');
        }
       }else{
        res.render('login',{message:"Email or Password is incorrect"});
       }
      }else{
      res.render('login',{message:"Email or Password is incorrect"});
      }
    }catch(error){
        console.log(error);
    }
 }

//  home page
const loadHome = async (req,res)=>{
    try{
       const userData = await User.findById({_id:req.session.user_id});
       res.render('home',{user:userData});
    }catch(error){
        console.log(error.message);
    }
}

const userLogout = async(req,res)=>{
    try{
         req.session.destroy();
         res.redirect('/');
    }catch(error){
        console.log(error.message);
    }
}

// forgot password
const forgotLoad = async (req,res)=>{
    try{
        res.render('forgot');
    
    }catch(error){
        console.log(error.message);
    }
}
// sending mail to reset password

const sendResetPasswordMail =async (name,email,token)=>{
    try{
       const transporter = nodemailer.createTransport({
       host: 'smtp.gmail.com',
       port: 587, // Port for TLS
       secure: false, // Set to false for TLS (true for SSL)
       requireTLS:true,
       auth: {
           user: config.emailUser, //  Gmail address
           pass: config.emailPassword     // The app password generated from Google
       }
   
        });
   
        const mailOptions = {
           from:config.emailUser,
           to:email,
           subject:'Reset Password',
           html: '<p>Hii ' + name + ', Click here to <a href="http://localhost:3000/forgot-password?token=' + token + '">RESET</a> your password </p>'
   
        }
   
        transporter.sendMail(mailOptions,function(error,info){
           if(error){
               console.log(error);
           }else{
               console.log("Email has been sent",info.response);
           }
        })
    }catch(err){
       console.log(err.message);
    }
    }

// verifying
const forgotVerify = async (req,res)=>{
    try{
        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if(userData){
             
             if(userData.is_verified===0){
                res.render('forgot',{message:"Please verify your email"});
             }else{
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email:email},{$set:{token:randomString}});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('forgot',{message:"Please check your mail to reset password"});
             }
        }else{
            res.render('forgot',{message:"User email is incorrect"});
        }
    }catch(error){
        console.log(error.message);
    }
}
// checking token is correct or not
const forgotPasswordLoad = async (req,res)=>{
    try{
        const token = req.query.token;
        const tokenData = await User.findOne({token:token});
        if(tokenData){
            res.render('forgot-password',{user_id:tokenData._id})
        }else{
            res.render('404',{message:"Token is Invalid"})
        }
    }catch(error){
        console.log(error.message);
    }
}
// now resetting the new password
const resetPassword = async (req,res)=>{
    try{
     const password=req.body.password;
     const user_id = req.body.user_id;
     const sPassword = await securePassword(password);
     const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:sPassword,token:''}});
     console.log('Password reset successful, redirecting to login...');
     res.redirect("/login");
    }catch(error){
        console.log('Error resetting password:', error.message);
    }
}

// profile editing by the user
const editLoad = async (req,res)=>{
    try{
        const id = req.query.id;
        const userData = await User.findById({_id:id});
        if(userData){
            res.render('edit',{user:userData})
        }else{
            res.redirect('/home')
        }
    }catch(error){
        console.log(error.message);
    }
}
// now updating the users data
const updateProfile = async (req,res)=>{
    try{
        if(req.file){
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,image:req.file.filename}});
        }else{
           const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile}});
        }
        res.redirect('/home');
    }catch(error){
        console.log(error.message);
    }
}
module.exports = {
    loadRegister,
    newUser,
    verifyMail,
    login,
    verifyLogin,
    loadHome,
    userLogout,
    forgotLoad,
    forgotVerify,
    forgotPasswordLoad,
    resetPassword,
    editLoad,
    updateProfile
}