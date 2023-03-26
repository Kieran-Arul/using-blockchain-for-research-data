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

// Cache current user's email and occupation for easy future look-up
let currentUserEmail = null;
let currentUserOccupation = null;

/*********** DATABASE CONNECTION ************/

mongoose.connect("mongodb://localhost:27017/researchSecureDB")
    .then(() => console.log("Connected to research secure DB"))
    .catch(() => console.log("Connection to research secure DB failed"));

/*********** DATABASE SCHEMA SET-UP ************/

// Defines a schema that will be used for a collection (table) in the database
// User table
const userSchema = new mongoose.Schema({

  email: String,
  password: String,
  occupation: String,
  fullName: String,
  addedResearchers: [String]

});

// Research data table
const researchDataSchema = new mongoose.Schema({

  researcherEmail: String,
  title: String,
  data: [String]

});

// Creates a MongoDB collection (equivalent to table) called "Users" (Mongo automatically changes User to 
// Users). Documents in this particular collection will follow the schema of "userSchema" defined above
const User = new mongoose.model("User", userSchema);
const ResearchData = new mongoose.model("ResearchData", researchDataSchema);

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

    res.render("main-menu", {
      occupation: currentUserOccupation
    })

  } else {

    res.redirect("/signin");

  }

})

app.get("/addTestSubject", (req, res) => {

  if (authenticated) {

    User.find({ occupation: "Test Subject" }, (err, testers) => {

      if (err) {

        console.log(err)
        res.redirect("/mainmenu")

      } else {

        res.render("addTestSubject", {
          participants: testers
        })

      }

    })

  } else {

    res.redirect("/signin");

  }

})

app.get("/submitResearchQuestions", (_, res) => {

  // Only let the user proceed if they are authenticated and are a researcher
  if (authenticated && currentUserOccupation === "Researcher") {

    res.sendFile(__dirname + "/client/submit-research-questions/submit-research-questions.html")

    // Redirect to the main menu if they are authenticated but not a researcher
  } else if (authenticated) {

    res.redirect("/mainmenu");

    // If they are not authenticated, force the user to sign in
  } else {

    res.redirect("/signin");

  }

})

app.get("/selectResearcher", (req, res) => {

  User.distinct('fullName', (err, names) => {

    if (err || !names) {
      res.redirect("/mainmenu");
    }

    

  })

})

app.get("/logout", (_, res) => {
  authenticated = false;
  currentUserOccupation = null;
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
          currentUserOccupation = returnedUser.occupation;
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

  const userFullName = req.body.fullName;
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

          const newUser = new User({
            email: userEmail,
            password: hashedPassword,
            occupation: userOccupation,
            fullName: userFullName
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

  let hasSubmissionError = false;

  Object.keys(req.body).forEach(key => {

    const newResearch = new ResearchData({
      researcherEmail: currentUserEmail,
      title: req.body[key],
      data: []
    })

    newResearch.save()
        .then(() => {
          console.log("Successfully saved research question");
        })
        .catch(err => {
          console.log(err);
          hasSubmissionError = true;
        })

  })

  if (hasSubmissionError) {
    res.redirect("/submitResearchQuestions");
  }

  res.redirect("/mainmenu");

})

app.post("/addTestSubject", (req, res) => {

  const testers = req.body.participants;

  console.log(testers);

  res.redirect("/mainmenu");

})

app.post("/viewResearchQuestions", (req, res) => {



})

/*********** EXPORTS ************/

module.exports = app;
