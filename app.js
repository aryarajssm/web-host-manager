const express = require('express');
const app = express();
const userModel = require("./models/user");
const cookieParser = require('cookie-parser');
const bcrypt=require('bcryptjs');
const jwt = require("jsonwebtoken")
const crypto = require("crypto"); //not to install 
const path = require('path');
// const upload = require("./config/multerconfig");


app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());


app.get('/',(req,res)=>{
    res.render("first");
});


app.post('/register',async (req,res)=>{
    let{name,email,password} =req.body;
    let user = await userModel.findOne({email});
    if(user) return res.status(500).send("User already registerd");

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async (err,hash)=>{
            let user = await userModel.create({
                name,
                email,
                password:hash
            });
            let token = jwt.sign({email:email,userid:user._id},"shhhh");
            res.cookie("token",token);
            // res.send("registered");
            res.status(200).redirect("profile");
        })
    })

});


app.get('/index',(req,res)=>{
    res.render("index");
})

app.get('/login',(req,res)=>{
    res.render("login");
})
app.post('/login',async (req,res)=>{
    let{email,password} = req.body;
    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("Register Yourself");
    bcrypt.compare(password,user.password,function(err,result){
        if(result)
            {
                let token = jwt.sign({email:email,userid:user._id},"shhhh");
                res.cookie("token",token);
                res.status(200).redirect("/profile");
            }
        else res.redirect("/login");
    })
});

app.get('/logout',(req,res)=>{
    res.cookie("token","");
    // res.redirect("/login");
    res.render("first");
})


app.get('/profile',isLoggedIn, async (req,res)=>{
   res.render('profile');
});

function isLoggedIn(req,res,next){
    if(req.cookies.token === "")res.redirect("/login");
    else{
        let data = jwt.verify(req.cookies.token ,"shhhh");
        req.user=data;
    }
    //console.log(req.cookies);
    next();
}
app.listen(3000);