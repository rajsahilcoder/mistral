const express = require("express");
const connectDB = require("./db");
const app = express();
const cookieParser = require("cookie-parser");
// var bodyParser          = require("body-parser");
// var mongoose            = require("mongoose");
// var passport            = require("passport");
// var localStrategy       = require("passport-local");
// var methodOverride      = require("method-override");
var flash = require("connect-flash");
const { adminAuth, userAuth } = require("./middleware/auth.js");
var Player              = require("./model/player");
var Memory              = require("./model/memory");
// var Team                = require("./model/team");
// var Schedule            = require("./model/schedule");
// var User                = require("./model/User");
const user = require("./model/User");
const Team = require("./model/team");
// const user = require("./model/User");
const PORT = 5000;

app.set("view engine", "ejs");

connectDB();

// static files
app.use(express.static('public'));
app.use('/css',express.static(__dirname+'public/css'));
app.use('/js',express.static(__dirname+'public/js'));
app.use('/img',express.static(__dirname+'public/img'));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./Auth/route"));

// ------- Passport configuration ---------//

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new localStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// app.use(function(req,res,next){
    // res.locals.currentUser = req.user;
    // res.locals.currentUser = req.body.user;
    // res.locals.error   = req.flash("error");
    // res.locals.success   = req.flash("success");
//     next();
// });


app.get("/", (req, res) => res.render("home"));
app.get("/register", (req, res) => res.render("register"));
app.get("/register_admin", (req, res) => res.render("register_admin"));
app.get("/login", (req, res) => res.render("login"));
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});
// admin after admin login //
app.get("/admin", adminAuth, (req, res) => res.render("dashboard"));

// Team //
app.get("/admin/myTeams",adminAuth,function(req,res){
  res.render("team",{team: Team});
  
})

app.get("/admin/newteam",adminAuth,function(req,res){
  res.render("newteam"); 
});


app.post("/admin/newteam",function(req,res){
   var newTeam = {
       image : req.body.logo,
       name : req.body.team,
       user : req.body.id
   };
   Team.create(newTeam,function(err,newteam){
      if(err)
      {
          console.log(err);
          res.redirect("/admin/newteam");
      }
      else
      {
          // req.flash("success","Successfully added a new team");
          res.redirect("/admin/myteams");
      }
   });
});


//------------------ Player route---------------//

app.get("/admin/myteams/:id",function(req,res){
   var _id = req.params.id;
  Team.findById({user:req.user.id,_id},function(err,team){
      if(err)
      {
          console.log(err);
      }
      else
      {
          Player.find({user:req.user.id,team:req.params.id},function(err,player){
             if(err)
             {
                 console.log(err);
             }
             else
             {
                res.render("players",{player:player,team:team});
             }
          });
      }
  });
});




// ------------------New Player------------//

app.get("/admin/myteams/:id/newplayer",adminAuth,function(req,res){
   var _id = req.params.id;
  Team.findById({_id},function(err,team){
      if(err)
      {
          console.log(err);
      }
      else
      {
       res.render("newplayer",{team:team});
      }
   });
});

app.post("/admin/myteams/:id",adminAuth,function(req,res){
   var newPlayer = {
       name        : req.body.name,
       fatherName  : req.body.fatherName,
       dateOfBirth : req.body.dateOfBirth,
       preTeam     : req.body.preTeam,
       address     : req.body.address,
       mobileNo    : req.body.mobileNo,
       email       : req.body.email,
       user        : req.user.id,
       team        : req.params.id
   };
   Player.create(newPlayer,function(err,newPlayer){
       if(err)
       {
           console.log(err);
           res.redirect("/admin/myteams/:id/newplayer");
       }
       else
       {
           req.flash("success","Successfully added a new player");
           res.redirect("/admin/myteams/" + req.params.id);
       }
   });
});

// -----------------Show Route-------------//

app.get("/admin/myteams/:id/:playerid",adminAuth,function(req,res){
  var _id = req.params.id;
  Team.findById({user:req.user.id,_id},function(err,team){
      if(err)
      {
          console.log(err);
      }
      else
      {
          var _id = req.params.playerid;
          Player.findById({_id,team:req.params.id},function(err,player){
             if(err)
             {
                 console.log(err);
             }
             else
             {
                res.render("show",{player:player,team:team});
             }
          });
      }
  });
});

//---------------- Edit Player ---------------//

app.get("/admin/myteams/:id/:playerid/edit",adminAuth,function(req,res){
   var _id = req.params.id;
  Team.findById({user:req.user.id,_id},function(err,team){
      if(err)
      {
          console.log(err);
      }
      else
      {
          var _id = req.params.playerid;
          Player.findById({_id,team:req.params.id},function(err,updatePlayer){
       if(err)
       {
           console.log(err);
       }
       else
       {
           if(updatePlayer.user != req.user.id)
           {
               res.redirect("/admin/myteams");
           }
           else
           {
                res.render("edit",{player:updatePlayer,team:team}); 
           }
          
       }
   });
      }
});
});
   

app.put("/admin/myteams/:id/:playerid",adminAuth,function(req,res){
   var _id = req.params.playerid;
  Player.findByIdAndUpdate({_id,team:req.params.id},req.body.player,function(err,updatedplayer){
      if(err)
      {
          console.log(err);
      }
      else
      {
          req.flash("success","Successfully edited details");
          res.redirect("/admin/myteams/"+req.params.id);
      }
  });
});

//--------------- Delete Route-----------//

app.delete("/admin/myteams/:id/:playerid",adminAuth,function(req,res){
   var _id = req.params.playerid;
 Player.findByIdAndRemove({_id,team:req.params.id},function(err){
     if(err)
     {
         res.redirect("/admin/myteams");
     }
     else
     {
         req.flash("success","Successfully deleted player");
         res.redirect("/admin/myteams/" + req.params.id);
     }
 }) ;
});

// --------------------Schedule Routes---------------//


app.get("/admin/schedule",adminAuth,function(req,res){
  Schedule.find({user:req.user.id},function(err,schedule){
       if(err)
       {
           console.log(err);
       }
       else
       {
           res.render("schedule",{schedule:schedule}); 
       }
   });
});

app.get("/admin/schedule/newschedule",adminAuth,function(req,res){
  res.render("newSchedule"); 
});

app.post("/admin/schedule",adminAuth,function(req,res){
   var scheduleDetails = {
       Teamname        : req.body.teamname,
       scheduleDate    : req.body.scheduleDate,
       time            : req.body.time,
       user            : req.user.id
   };
   Schedule.create(scheduleDetails,function(err,scheduleDetails){
       if(err)
       {
           console.log(err);
       }
       else
       {
           req.flash("success","Added a new schedule");
           res.redirect("/admin/schedule");     
       }
   });
});
//-------------------- Delete Schedule-------------//

app.delete("/admin/schedule/:id",adminAuth,function(req,res){
 Schedule.findByIdAndRemove(req.params.id,function(err){
     if(err)
     {
         res.redirect("/admin/schedule");
     }
     else
     {
         req.flash("success","Successfully Deleted");
         res.redirect("/admin/schedule");
     }
 });
});






app.get("/basic", userAuth, (req, res) => res.render("user"));

const server = app.listen(PORT, () =>
  console.log(`Server Connected to port ${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.log(`An error occurred: ${err.message}`);
  server.close(() => process.exit(1));
});