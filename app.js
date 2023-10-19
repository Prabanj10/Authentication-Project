require('dotenv').config()
const md5 = require("md5")
const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose =require("mongoose")
const encrypt = require("mongoose-encryption")

const app = express();

app.use(bodyParser.urlencoded({
    extended:true
}))
app.set("view engine","ejs")
app.use(express.static("public"))

mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema = new mongoose.Schema({
    email:String,
    password:String

})



const User = new mongoose.model("user",userSchema);


app.get("/",function(req,res){
    res.render("home");
})

app.get("/register",function(req,res){
    res.render("register")
})

app.post("/register",function(req,res){
    
    const user1 = new User({
        email: req.body.username,
        password: md5(req.body.password)
    })
    
    user1.save().then(function(){
        res.render("secrets")
    }).catch(function(err){
        console.log(err)
    })

})

app.get("/login",function(req,res){
    res.render("login")
})

app.post("/login",function(req,res){
    const username = req.body.username
    const password = md5(req.body.password)
    User.findOne({email:username}).then(function(foundUser){
        if(foundUser.password===password){
            res.render("secrets")
        }
    }).catch(function(err){
        console.log(err)
    })
})









app.listen(3000,function(req,res){
    console.log("port 3000")
})