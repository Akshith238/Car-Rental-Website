require("dotenv").config();
const fs=require("fs");
const express=require("express");
const mongoose=require("mongoose");
const bodyParser=require("body-parser");
const session = require('express-session');
const app=express();
const https=require("https");
const jsdom = require('jsdom');
const ejs = require('ejs');
const { JSDOM } = jsdom;
const nodemailer=require("nodemailer");
const { dirname } = require("path");
const jwt = require('jsonwebtoken');
const url1='http://localhost:3000/signin';
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'rentalsroyalcar@gmail.com',
        pass: 'ecngcutsridlytfa'
    }
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname));
const url = "mongodb+srv://Akshith238:Akshith238@car-rental.ueiqns4.mongodb.net/?retryWrites=true&w=majority";
const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })
 const userschema = new mongoose.Schema({
     username: String,
     email: String,
     password: String,
     status:{
        type:String,
        enum:['Verified','Not Verified'],
        default:'Not Verified'
     },
     loginstatus:Number
 });
 const orderschema=new mongoose.Schema({
    email:String,
    model:String,
    city:String,
    location:String,
    startdate:String,
    enddate:String,
    starttime:String,
    endtime:String
 })
const user=mongoose.model("user",userschema);
const order=mongoose.model("order",orderschema);
app.get("/",function(req,res){
     res.sendFile(__dirname+"/index.html")
});
app.get("/signup",function(req,res){ 
    res.sendFile(__dirname+"/signup.html")
});

app.post("/signup",function(req,res){
         global.u=req.body.username;
         global.e=req.body.email;
         global.pw=req.body.password;
         global.repw=req.body.repassword;
         if(pw!=repassword){
             res.status(400).send('<script>alert("Re-enter the password correctly!")</script>');

         }
         else{
            user.find({username:u})
                .then(data => {
                    if(data[0]){
                        if(data[0].username===u){
                            res.status(400).send('<script>alert("Username already exists!")</script>');  
                        }
                        else{
                            fs.readFile('Newmessage.html', {encoding: 'utf-8'}, function (err, html) {
                                let mailOptions = {
                                    from: 'rentalsroyalcar@gmail.com',
                                    to: global.e,
                                    subject: 'Royal Rental Email Confirmation',
                                    html: html
                                };  
                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        return console.log(error);
                                    }
                                    console.log('Message sent: %s', info.messageId);
                                });       
                                console.log("saved data successfully")
                                res.sendFile(__dirname+"/Confirm.html")
                            })
                            
                            app.get("/verify",function(req,res){
                                const use = new user({
                                    username: global.u,
                                    email: global.e,
                                    password: global.pw,
                                    status:'Verified',
                                    loginstatus:0
                                });
                                use.save()
                                    .then(
                                        () =>{   
                                               res.status(200).sendFile(__dirname+"/success.html");}
                                    );
                            })
                            
                        }
                    }
                    else{
                        fs.readFile('Newmessage.html', {encoding: 'utf-8'}, function (err, html) {
                            let mailOptions = {
                                from: 'rentalsroyalcar@gmail.com',
                                to: global.e,
                                subject: 'Royal Rental Email Confirmation',
                                html: html
                            };  
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    return console.log(error);
                                }
                                console.log('Message sent: %s', info.messageId);
                            });       
                            console.log("saved data successfully")
                            res.sendFile(__dirname+"/Confirm.html")
                        })
                            
                        app.get("/verify",setSharedVariable,function(req,res){
                            const use = new user({
                                username: global.u,
                                email: global.e,
                                password: global.pw,
                                status:'Verified',
                                loginstatus:0
                            });
                            use.save()
                                .then(
                                    () =>{   
                                           res.status(200).sendFile(__dirname+"/success.html");}
                                );
                        })
                    }
                })
            
         }
     
});

app.get("/signin",function(req,res){
    res.sendFile(__dirname+"/signin.html")
})

app.post("/signin",function(req,res){
      const u1=req.body.username;
      const p1=req.body.password;  
     user.find({username:u1})
         .then( data => {
               if(data[0].password===p1){
                    res.render("index",{usname:u1})
                    user.updateOne({username:u1},{$set:{loginstatus:1}},{new:true})
                        .then(()=>console.log("data updated successfully"))
                        .catch(err=>console.log(err))
               }
               else{
                    res.sendFile(__dirname+"/failure2.html")
               }
          })
          .catch(err => res.sendFile(__dirname+"/failure2.html"))
        })      

app.post("/book",function(req,res){
    var int=req.query.input;
    const m=req.body.carmodel;
    const c=req.body.city;
    const l=req.body.pickup;
    const sd=req.body.startdate;
    const ed=req.body.enddate;
    const st=req.body.starttime;
    const et=req.body.endtime;
    user.findOne({username:int})
        .then(data=>{
            const em=data.email
            const ord=new order({
                email:em,
                model:m,
                city:c,
                location:l,
                startdate:sd,
                enddate:ed,
                starttime:st,
                endtime:et
            })
            ord.save()
               .then(()=>{
                ejs.renderFile('bookingemail.ejs', { model: m,city:c,location:l,date:sd,time:st }, function(err, html) {
                    if (err) {
                        return console.log(err);
                    }
        
                    let mailOptions = {
                        from: 'rentalsroyalcar@gmail.com',
                        to: em,
                        subject: 'Royal Rental Booking Confirmation',
                        html: html
                    };
        
                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                        return console.log(error);
                        }
                        console.log('Message sent: %s', info.messageId);
                    });
                    console.log("Email sent successfully");
                    });
               })
               .catch(err=>console.log(err))
            res.render("booksuccess",{usname:int})
        })
        .catch(err=>console.log(err))
})
app.get("/signedin",function(req,res){
            var int=req.query.input;
            res.render("index",{usname:int})
})
app.get("/signout",function(req,res){
    var int=req.query.input;
    user.updateOne({username:int},{$set:{loginstatus:0}},{new:true})
                        .then(()=>console.log("data updated successfully"))
                        .catch(err=>console.log(err))
    res.sendFile(__dirname+"/index.html")
})
app.get("/profile",function(req,res){
    var input=req.query.input;
    user.findOne({username:input})
         .then(user=>{
            res.render("profile",{usname:input,usemail:user.email})
         })
         .catch(err=>{console.log('Error Occurs');})
})

app.get("/forgot",function(req,res){
    res.sendFile(__dirname+"/forgotpassword.html")
})

app.post("/forgot",function(req,res){
    var em=req.body.resetemail;
    user.findOne({email:em})
        .then(user=>{
            ejs.renderFile('forgotmessage.ejs', { usname: user.username,pass:user.password }, function(err, html) {
            if (err) {
                return console.log(err);
            }

            let mailOptions = {
                from: 'rentalsroyalcar@gmail.com',
                to: em,
                subject: 'Royal Rental Forgot Password',
                html: html
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
            });
            res.status(200).send("<script>alert('Email Sent!')</script>")
            console.log("Email sent successfully");
            });

        })
        .catch(err=>{
            res.status(404).send("<script>alert('Email does not Exist!')</script>")
            console.log('Error Occurs');
        })
    
})

app.listen(process.env.PORT|| 3000,function(err){
     if(err) throw err;
     console.log("Server running on port 3000.");
})