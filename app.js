var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/irctcdemo");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("img"));

// SCHEMA SETUP
var restHouseSchema = new mongoose.Schema({
  name: String,
  image: String,
  roomType: String,
  roomQty: Number,
  availability: Number,
  address: String,
  city: String,
  description: String,
});

var Resthouse = mongoose.model("Resthouse", restHouseSchema);

// Resthouse.create(
//      {
//          name: "Mahabaleshwar Holiday Resthouse",
//          image: "https://goo.gl/u7pLJY",
//         // roomType: "Deluxe",
//          //roomQty: 4,
//         // availability: 3,
//          address:"Tapola Road 35-malusarwadi, 412806 Mahabaleshwar, India",
//          city: "Mahabaleshwar",
//          description: "Featuring free WiFi, Forest County Resort offers accommodations in Mahabaleshwar. Guests can enjoy the on-site restaurant. Free private parking is available on site."

//      },
//      function(err, resthouse){
//       if(err){
//           console.log(err);
//       } else {
//           console.log("NEWLY CREATED Resthouse: ");
//           console.log(resthouse);
//       }
//     });

app.get("/", function (req, res) {
  res.redirect("/irctcTourism");
});

// - show all resthouses
app.get("/irctcTourism", function (req, res) {
  // Get all resthouses from DB
  Resthouse.find({}, function (err, allResthouse) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", { resthouses: allResthouse });
    }
  });
});

//CREATE - add new resthouse to DB
app.post("/irctcTourism", function (req, res) {
  // get data from form and add to resthouses array
  var name = req.body.name,
    image = req.body.image,
    address = req.body.address,
    city = req.body.city,
    desc = req.body.description;
  var newResthouse = {
    name: name,
    image: image,
    address: address,
    city: city,
    description: desc,
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
//Login form display
app.get("/irctcTourism/login", function (req, res) {
  res.render("login");
});
//Sign up form display
app.get("/irctcTourism/signup", function (req, res) {
  res.render("signup");
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
  // get data from form and add to resthouses array
  var city = req.body.cityName,
    checkIn = req.body.checkInDate,
    checkOut = req.body.checkOutDate,
    guest = req.body.guestNo;
  // searchResult = Resthouse.find({
  //     "city": city
  // });
  var searchResthouse = {
    city: city,
    checkIn: checkIn,
    checkOut: checkOut,
    guest: guest,
    searchResult: Resthouse.find({}),
  };
  res.render("book", { searchResthouse: searchResthouse });
});

// SHOW - shows more info about each resthouse
app.get("/irctcTourism/:id", function (req, res) {
  //find the resthouse with provided ID
  Resthouse.findById(req.params.id, function (err, foundResthouse) {
    if (err) {
      console.log(err);
    } else {
      //render show template with that resthouse
      res.render("show", { resthouse: foundResthouse });
    }
  });
});

app.get("/contactIRCTC", function (req, res) {
  res.render("contact");
});
app.listen(process.env.PORT, process.env.IP, function () {
  console.log("The Server Has Started!");
});
