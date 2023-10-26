require("dotenv").config();
const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose =require("mongoose")
const session = require('express-session')
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const GoogleStrategy = require('passport-google-oauth20').Strategy




const app = express();

app.use(bodyParser.urlencoded({
    extended:true
}))
app.set("view engine","ejs")
app.use(express.static("public"))

app.use(session({
    secret:'lalaland is poor',
    resave:false,
    saveUninitialized:false,

}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema = new mongoose.Schema({
    email:String,
    password:String

})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("user",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET, 
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/",function(req,res){
    res.render("home");
})

app.get("/auth/google",function(req,res){
    passport.authenticate('google', { scope: ['profile'] })
})

app.get("/register",function(req,res){
    res.render("register")
})

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("login")
    }
})

app.post("/register",function(req,res){
    User.register({username:req.body.username,active:false},req.body.password,function(err,user){
        if(err){
            console.log(err)
            res.render("register")
        }else{
        passport.authenticate("local")(req,res,function(){
            res.render("secrets")
        })
        }
    })

   
})

app.get("/login",function(req,res){

    res.render("login")
})

app.post("/login",function(req,res){
    const user = new User({
        username:req.body.username,
        password:req.body.password
    })
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res),function(){
                res.redirect("secrets")

            }
        }
    })
    
})

// app.get("/logout",function(req,res){
//     req.logout(function(err){
//         if(err){return next(err)
//         }

//     });
//     res.redirect("/")
// })









app.listen(3000,function(req,res){
    console.log("port 3000")
})