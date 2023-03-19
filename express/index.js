const express=require("express");
const bodyParser=require("body-parser");
const https=require("https");
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.get("/",function(request,response){
    response.sendFile(__dirname+"/server.html");
});
app.post("/",function(req,res){
    const query=req.body.location;
    const key ="4fb2cb4b05msh06e028da46f0709p1cd5cbjsn043f2f5c9440"
    const url="https://weatherapi-com.p.rapidapi.com/current.json?q="+query+"&rapidapi-key="+key;
    https.get(url,function(response){
         response.on("data",function(data){
               const d=JSON.parse(data);
               const icon=d.current.condition.icon;
               const temp=d.current.temp_c;
               const imageurl="https:"+icon;
               res.send("<img src="+imageurl+"><h1>The current temperature in celsius in "+query+" is:"+temp+" degrees.</h1>");
         });
    });
});


/*
app.get("/",function(req,res){
    res.sendFile(__dirname + "../index.html")
});
app.post("/bmicalculator",function(req,res){
    var weight=Number(req.body.weight);
    var height=Number(req.body.height);
    var result=weight/Math.pow(height,2);
    res.send("The BMI is:"+result);
});*/
app.listen(3000,function(){
    console.log("server started on port 3000")
});