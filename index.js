var express = require("express");
var app = express();

var bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  //bcrypt = require('bcrypt'),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  session = require("express-session");

app.use(express.static("public"));
// SCHEMA SETUP
mongoose.connect("mongodb://localhost:27017/resthouse_1");

app.use(
  session({
    secret: "Keep It Simple Silly",
    saveUninitialized: false,
    resave: false,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

var restBookingSchema = new mongoose.Schema({
  city: String,
  checkIn: Date,
  checkOut: Date,
  guestNo: Number,
});

var restHouseSchema = new mongoose.Schema({
  name: String,
  image: String,
  roomsAC: Number,
  roomsGen: Number,
  address: String,
  city: String,
  description: String, //date and the class of the room
});

var restHouseBookingsSchema = new mongoose.Schema({
  username: String,
  roomType: Number,
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  fare: Number,
  bookingDate: Date,
  designation: Number,
  roomType: Number,
  reason: Number,
});

var officialRequestSchema = new mongoose.Schema({
  userid: String,
  reason: String,
  requestorsID: String,
});

//  create a schema according to the docs and store it in an own folder
// the schema should describe the fields we have in our form and specify the data it can expect
// It should look something like this:

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
  },
  contact: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
  },
  designation: {
    type: Number,
    required: true,
  },
});

var bookingDetailsSchema = new mongoose.Schema({
  username: { type: String },
  city: { type: String },
  checkIn: { type: Date },
  checkOut: { type: Date },
  guestNo: { type: Number },
  roomType: { type: Number },
  reason: { type: Number },
});

UserSchema.plugin(passportLocalMongoose);

// UserSchema.statics.authenticate = function (email, password, callback) {
//     User.findOne({ email: email })
//       .exec(function (err, user) {
//         if (err) {
//           return callback(err)
//         } else if (!user) {
//           var err = new Error('User not found.');
//           err.status = 401;
//           return callback(err);
//         }
//         bcrypt.compare(password, user.password, function (err, result) {
//           if (result === true) {
//             return callback(null, user);
//           } else {
//             return callback();
//           }
//         })
//       });
// }

// UserSchema.pre('save', function (next) {
//     var user = this;
//     bcrypt.hash(user.password, 10, function (err, hash){
//       if (err) {
//         return next(err);
//       }
//       user.password = hash;
//       next();
//     })
//   });

var User = mongoose.model("User", UserSchema);
module.exports = User;
var bookingDetails = mongoose.model("bookingDetails", bookingDetailsSchema);
var Resthouse = mongoose.model("Resthouses", restHouseSchema);
var Restbooking = mongoose.model("Restbookings", restBookingSchema);
var officialRequest = mongoose.model("officialRequest", officialRequestSchema);
var Resthousebooking = mongoose.model(
  "Resthousebookings",
  restHouseBookingsSchema
);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.get("/", function (req, res) {
  res.redirect("/irctcTourism");
});

app.get("/irctcTourism/prebook", function (req, res) {
  res.render("prebook");
});

app.get("/login", function (req, res) {
  res.render("login");
  //res.redirect("/irctcTourism");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/irctcTourism",
    failureRedirect: "/login",
  }),
  function (req, res, next) {
    // console.log(req.body.logemail);
    // console.log(req.body.logpassword);
    // if(req.body.logemail && req.body.logpassword) {
    //     User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
    //       if (error || !user) {
    //         var err = new Error('Wrong email or password.');
    //         err.status = 401;
    //         return next(err);
    //       } else {
    //         req.session.userId = user._id;
    //         return res.redirect('/profile');
    //       }
    //     });
    //   } else {
    //     var err = new Error('All fields required.');
    //     err.status = 400;
    //     return next(err);
    //   }
  }
);

// GET route after registering
app.get("/profile", function (req, res, next) {
  User.findById(req.session.userId).exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      return res.json({ name: user.name, email: user.email });
    }
  });
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.post("/signup", function (req, res, next) {
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error("Passwords do not match.");
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (
    req.body.name &&
    req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf &&
    req.body.contact &&
    req.body.designation &&
    req.body.railwayID
  ) {
    var userData = {
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      passwordConf: req.body.passwordConf,
      contact: req.body.contact,
      designation: req.body.designation,
      railwayID: req.body.railwayID,
    };
    //use schema.create to insert data into the db
    User.register(
      new User({
        email: req.body.email,
        username: req.body.username,
        contact: req.body.contact,
        designation: req.body.designation,
        railwayID: req.body.railwayID,
      }),
      req.body.password,
      function (err, user) {
        if (err) {
          console.log(err);
          return res.render("signup");
        }
        passport.authenticate("local")(req, res, function () {
          // res.redirect("/login");
        });
      }
    );
    // User.create(userData, function (err, user) {
    //   if (err) {
    //     return next(err)
    //   } else {
    //     return res.redirect('/login'); // profile == login
    //   }
    // });
  }
  res.redirect("/login");
});

// GET /logout
app.get("/logout", function (req, res, next) {
  // if (req.session) {
  //   // delete session object
  //   req.session.destroy(function(err) {
  //     if(err) {
  //       return next(err);
  //     } else {
  //       return res.redirect('/login');
  //     }
  //   });
  // }
  req.logout();
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
// app.get("/admin", function(req, res){
//     res.render("lg&su/admin.ejs");
// });
// app.get("/landingpage", function(req, res){
//     res.render("user/landingpage.ejs");
// });
// app.get("/resthouse", function(req, res){
//     res.render("user/resthouse.ejs");
// });
// app.get("/result", function(req, res){
//     res.render("user/result.ejs");
// });
// app.get("/mybooking", function(req, res){
//     res.render("user/mybooking.ejs");
// });
// app.get("/contact", function(req, res){
//     res.render("user/contact.ejs");
// });

// - show all resthouses
app.get("/irctcTourism", function (req, res) {
  // Get all resthouses from DB
  Resthouse.find({}, function (err, allResthouse) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", { resthouses: allResthouse, currentUser: req.user });
    }
  });
});

//CREATE - add new resthouse to DB
// app.post("/irctcTourism", function(req, res){
//     // get data from form and add to resthouses array
//     var name = req.body.name,
//     image    = req.body.image,
//     address  = req.body.address,
//     city     = req.body.city,
//     desc     = req.body.description;
//     var newResthouse = {name: name, image: image, address: address, city: city, description: desc}
//     // Create a new resthouse and save to DB
//     Resthouse.create(newResthouse, function(err, newlyCreated){
//         if(err){
//             console.log(err);
//         } else {
//             //redirect back to resthouse page
//             res.redirect("/irctcTourism");
//         }
//     });
// });

//CREATE - add new resthouse to DB redirected from /irctcTourism/new
app.post("/irctcTourism", function (req, res) {
  // get data from form and add to resthouses db
  var name = req.body.name,
    image = req.body.image,
    address = req.body.address,
    city = req.body.city,
    desc = req.body.description,
    roomQty0 = req.body.roomsGen,
    roomQty1 = req.body.roomsAC;

  var newResthouse = {
    name: name,
    image: image,
    address: address,
    city: city,
    description: desc,
    roomsGen: roomQty0,
    roomsAC: roomQty1,
  };
  // Create a new resthouse and save to DB
  Resthouse.create(newResthouse, function (err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      //redirect back to resthouse page
      res.redirect("/irctcTourism");
    }
  });
});

//NEW - show form to create new resthouse
app.get("/irctcTourism/new", function (req, res) {
  res.render("new");
});

app.get("/irctcTourism/search", function (req, res) {
  // Get all resthouses from DB
  Resthouse.find({}, function (err, allResthouse) {
    res.render("search", { resthouses: allResthouse });
  });
});

//BOOK - show searched resthouses for booking
app.post("/irctcTourism/search", function (req, res) {
  // get data from form and add to resthouses database
  var city = req.body.city,
    checkIn = req.body.checkIn,
    checkOut = req.body.checkOut,
    guest = req.body.guest,
    oclass = req.body.oclass;
  var roomType = 0;
  if (oclass < 3) roomtType = 0;
  else roomType = 1;
  var resthouseData = {
    city: city,
    checkIn: checkIn,
    checkOut: checkOut,
    guest: guest,
    roomType: roomType,
  };
  var newRestbooking = {
    city: city,
    checkIn: checkIn,
    checkOut: checkOut,
    guestNo: guest,
  };
  Restbooking.create(newRestbooking, function (err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      //redirect back to resthouse search page
      //res.redirect("/irctcTourism/search");
    }
  });
  //console.log(resthouseData);
  //     Resthouse.find({
  //         city: city
  //    }, function(err, searchResult){
  //        if(err) console.log(err);

  //    var searchResthouse = {city: city, checkIn: checkIn, checkOut: checkOut, guest: guest, searchResult: searchResult};
  //    res.render("book", {searchResthouse: searchResthouse});

  //    });

  // });
  // var searchResthouse = {city: city, checkIn: checkIn, checkOut: checkOut, guest: guest, searchResult: searchResult};
  // res.render("book", {searchResthouse: searchResthouse});
  // Create a new resthouse and save to DB
  Resthouse.find({ city: city }, function (err, roomprop) {
    if (roomType == 0) var qty = roomprop.roomsGen;
    else var qty = roomprop.roomsAC;

    Resthousebooking.find(
      {
        $and: [
          { city: city },
          { roomType: roomType },
          {
            $or: [
              {
                $and: [
                  { checkIn: { $gte: checkIn } },
                  { checkIn: { $lte: checkOut } },
                ],
              },
              {
                $and: [
                  { checkOut: { $gte: checkIn } },
                  { checkOut: { $lte: checkOut } },
                ],
              },
            ],
          },
        ],
      },
      function (err, queryResult) {
        if (err) console.log(err);
        if (queryResult.length < qty) {
          // Resthouse.find({"$and" : [{city:resthouseData.city}]}, function(err, searchRes){
          //     if(err)
          //         console.log(err);
          //     else{
          //         var searchResthouse = {resthouseData:resthouseData, searchRes: searchRes, }
          //         var details = {city: resthouseData.city, checkIn: resthouseData.checkIn, checkOut: resthouseData.checkOut, guestNo: resthouseData.guestNo,
          //                         roomType: resthouseData.roomType, username: currentUser.username};
          //         console.log(resthouseData);
          //         console.log(searchRes);
          //         bookingDetails.create(details, function(err, newDetails))
          //         {
          //         res.render("show", {searchResthouse: searchResthouse});
          //         //res.redirect('/irctcTourism/' + searchResthouse.searchRes[0]._id);
          //         }
          //     }
          //     });

          var details = {
            city: resthouseData.city,
            checkIn: resthouseData.checkIn,
            checkOut: resthouseData.checkOut,
            guestNo: resthouseData.guestNo,
            roomType: resthouseData.roomType,
            username: req.user.username,
          };
          bookingDetails.create(details, function (err, newDetails) {});
          res.redirect("/irctcTourism/show");
        } else {
          res.send("Not Found!");
        }
      }
    );
  });
  // if(result == 0)
  // {
  //     Resthouse.find({"$and" : [{city:city}, {roomType: 0}]}, function(err, searchRes){
  //     if(err)
  //         console.log(err);
  //     else{
  //         var searchResthouse = {city: city, checkIn: checkIn, checkOut: checkOut, guest: guest, searchRes: searchRes}
  //         res.render("book", {searchResthouse: searchResthouse});
  //     }
  //     });
  // }

  //     function(err, newlyCreated){
  // if(err){
  //     console.log(err);
  // } else {
  //     //redirect back to resthouse page

  //     res.redirect("/searchResult");
  // }
  // }

  // else{

  // }
});

app.get("/myBooking", function (req, res) {
  res.render("mybooking");
});
// SHOW - shows more info about one resthouse

app.get("/irctcTourism/show", function (req, res) {
  bookingDetails.findOne(
    { username: req.user.username },
    function (err, resDetails) {
      if (err) {
        console.log(err);
      } else {
        Resthouse.find(
          { $and: [{ city: resDetails.city }, { roomType: 0 }] },
          function (err, searchRes) {
            if (err) {
              console.log(err);
            } else {
              console.log(resDetails);
              var searchResthouse = {
                resthouseData: resDetails,
                searchRes: searchRes,
              };
              res.render("show", { searchResthouse: searchResthouse });
            }
          }
        );
      }

      //find the resthouse with provided ID
      // Resthouse.findById(req.params.id, function(err, foundResthouse){
      //     if(err){
      //         console.log(err);
      //     } else {
      //         //render show template with that resthouse
      //         res.render("show", {resthouse: foundResthouse});
      //     }
      // });
    }
  );
});

// app.get("/prebook", function(req, res){
//     res.render("prebook", {});//use data from login and pass it
// });

app.post("/prebook", function (req, res) {
  var username = req.body.username,
    bookingDate = new Date(),
    city = req.body.city,
    roomType = req.body.roomType,
    fare = req.body.fare,
    reason = req.body.reason;

  bookingDetails.findOne(
    { username: req.user.username },
    function (err, resDetails) {
      var newBooking = {
        username: resDetails.username,
        bookingDate: bookingDate,
        checkIn: resDetails.checkIn,
        checkOut: resDetails.checkOut,
        city: resDetails.city,
        roomType: roomType,
        fare: 20,
        reason: reason,
      };

      Resthousebooking.create(newBooking, function (err, bookings) {
        if (err) console.log(err);
        else {
          console.log(newBooking);
          res.render("prebook", { newBooking: newBooking });
        }
      });
    }
  );
});

app.get("/reqform", function (req, res) {
  res.render("reason");
});

app.post("/reqform", function (err, res) {
  var userid = req.body.userid;
  var reason = req.body.reason;
  var requestorsID = req.body.requestorsID;
  officialRequest.create(
    { userid: userid, reason: reason, requestorsID: requestorsID },
    function (err, request) {
      res.redirect("/irctcTourism");
    }
  );
});

app.get("/contactIRCTC", function (req, res) {
  res.render("contact");
});

app.get("/logAdmin", function (req, res) {
  res.render("admin");
});

app.listen(3000, function () {
  console.log("Server has started");
});
