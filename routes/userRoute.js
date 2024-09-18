const express = require('express');
const user_route = express();
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const config = require("../config/config");
user_route.use(session({secret:config.sessionSecret}));
const auth = require ("../middleware/auth.js");
user_route.set('view engine','ejs');
user_route.set('views', path.join(__dirname, '../views/users'));
const bodyParser = require('body-parser');
user_route.use(bodyParser.urlencoded({extended:true}));
const userController = require("../controllers/userController");

const storage = multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null,path.join(__dirname,'../public/userImages'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }

});
// starting changes
user_route.use(express.static('public'));
const upload = multer({storage:storage});
user_route.get('/',auth.isLogout,userController.loadRegister);
user_route.post('/register',upload.single('image'),userController.newUser);
// user_route.get('/verify',userController.verifyMail);
user_route.get('/register/verify', userController.verifyMail);
user_route.get("/",auth.isLogout,userController.login);
user_route.get("/login",auth.isLogout,userController.login);
user_route.post('/login',);
user_route.post('/login',userController.verifyLogin);
user_route.get('/home',auth.isLogin,userController.loadHome);
user_route.get('/logout',auth.isLogin,userController.userLogout);
user_route.get('/forgot',auth.isLogout,userController.forgotLoad);
user_route.post("/forgot",userController.forgotVerify);
user_route.get('/forgot-password',auth.isLogout,userController.forgotPasswordLoad);
user_route.post('/forgot-password',userController.resetPassword);
user_route.get('/edit',auth.isLogin,userController.editLoad);
user_route.post('/edit',upload.single('image'),userController.updateProfile);
module.exports = user_route
