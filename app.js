/*********** GENERAL SET-UP ************/

const express = require("express");
const app = express();

const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

app.use(express.static("client"));

app.set("view engine", "ejs");

app.use(express.urlencoded({
  extended: true
}));

let authenticated = false;
let currentUserEmail = null;
let currentUserOccupation = null;

/*********** DATABASE CONNECTION ************/

mongoose.connect("mongodb://localhost:27017/researchSecureDB")
    .then(() => console.log("Connected to research secure DB"))
    .catch(() => console.log("Connection to research secure DB failed"));

/*********** DATABASE SCHEMA SET-UP ************/

// Defines a schema that will be used for a collection (table) in the database
const userSchema = new mongoose.Schema({

  email: String,
  password: String,
  occupation: String,

  researchData: [{
    title: String,
    data: [String]
  }]

});

// Creates a MongoDB collection (equivalent to table) called "Users" (Mongo automatically changes User to 
// Users). Documents in this particular collection will follow the schema of "userSchema" defined above
const User = new mongoose.model("User", userSchema);

/*********** API GET ENDPOINTS ************/

app.get("/", (_, res) => {
  res.sendFile(__dirname + "/client/homepage/index.html")
})

app.get("/signin", (_, res) => {
  res.sendFile(__dirname + "/client/sign-in/signin.html")
})

app.get("/signup", (_, res) => {
  res.sendFile(__dirname + "/client/sign-up/signup.html")
})

app.get("/signup", (_, res) => {
  res.sendFile(__dirname + "/client/sign-up/signup.html")
})

app.get("/mainmenu", (_, res) => {

  if (authenticated) {

    res.sendFile(__dirname + "/client/main-menu/main-menu.html")

  } else {

    res.redirect("/signin");

  }

})

app.get("/submitResearchQuestions", (_, res) => {

  if (authenticated) {

    res.sendFile(__dirname + "/client/submit-research-questions/submit-research-questions.html")

  } else {

    res.redirect("/signin");

  }

})

app.get("/logout", (_, res) => {
  authenticated = false;
  res.redirect("/");
})

/*********** API POST ENDPOINTS ************/

app.post("/signin", (req, res) => {

  const userEmail = req.body.email;
  const userPassword = req.body.password;

  User.findOne({email: userEmail}, (err, returnedUser) => {

    if (err) {

      console.log(err);

    } else if (returnedUser) {

      bcrypt.compare(userPassword, returnedUser.password, (err, isCorrect) => {

        if (err) {
          res.redirect("/signin");
        }

        if (isCorrect === true) {

          authenticated = true;
          currentUserEmail = returnedUser.email;
          res.redirect("/mainmenu");

        } else {

          res.redirect("/signin");

        }

      })

    }

    else {
      res.redirect("/signin");
    }

  })

})

app.post("/signup", (req, res) => {

  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userOccupation = req.body.occupation;

  User.findOne({email: userEmail}, (err, returnedUser) => {

    // Email already exists
    if (returnedUser) {

      console.log(userEmail + " already exists");
      res.redirect("/signup");

      // Email does not exist but error occurred somewhere
    } else {

      if (err) {

        console.log(err);
        res.redirect("/signup");

        // No error and email does not exist --> must be a new user
      } else {

        bcrypt.hash(userPassword, saltRounds, (err, hashedPassword) => {

          // researchData: [] is added by default as defined in the schema above
          const newUser = new User({
            email: userEmail,
            password: hashedPassword,
            occupation: userOccupation,
            researchData: []
          });

          newUser.save()
              .then(() => {
                authenticated = true;
                currentUserEmail = userEmail;
                currentUserOccupation = userOccupation;
                res.redirect("/mainmenu");
              })
              .catch(err => {
                console.log(err);
                res.redirect("/signup");
              });

        })

      }

    }

  });

})

app.post("/submitResearchQuestions", (req, res) => {

  console.log(req.body);
  res.redirect("/mainmenu");

})

/*********** EXPORTS ************/

module.exports = app;
