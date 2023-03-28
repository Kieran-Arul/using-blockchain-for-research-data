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
  researchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]

});

// Research data table
const researchDataSchema = new mongoose.Schema({

  researcherEmail: String,
  title: String,
  responses: [String]

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

    User.findOne({email: currentUserEmail}, (err, returnedUser) => {

      if (err) {

        res.render("failure", {
          message: "Something went wrong. Please try and sign in again",
          route: "/signin"
        })

      } else if (returnedUser) {

        res.render("main-menu", {
          occupation: returnedUser.occupation
        })

      }

    })

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated. Please sign in first.",
      route: "/signin"
    })

  }

})

app.get("/addTestSubject", (req, res) => {

  if (authenticated) {

    User.find({ occupation: "Test Subject" }, (err, testers) => {

      if (err) {

        console.log(err)
        res.redirect("/mainmenu")

      } else {

        res.render("add-test-subject", {
          participants: testers
        })

      }

    })

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated. Please sign in first.",
      route: "/signin"
    })

  }

})

app.get("/submitResearchQuestions", (_, res) => {

  if (authenticated) {

    User.findOne({email: currentUserEmail}, (err, returnedUser) => {

      if (err) {

        res.render("failure", {
          message: "Something went wrong. Please try again",
          route: "/mainmenu"
        })

      } else if (returnedUser) {

        if (returnedUser.occupation === "Researcher") {

          res.sendFile(__dirname + "/client/submit-research-questions/submit-research-questions.html")

        } else {

          res.render("failure", {
            message: "This page is blocked as you are not a researcher.",
            route: "/mainmenu"
          })

        }

      }

    })

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated. Please sign in first.",
      route: "/signin"
    })

  }

})

app.get("/selectResearcher", async (req, res) => {

  if (authenticated) {

    try {

      const currentUser = await User.findOne({email: currentUserEmail}).populate("researchers");

      res.render("select-researcher", {
        researcherList: currentUser.researchers
      })

    } catch (e) {
      res.render("failure", {
        message: "Something went wrong.",
        route: "/mainmenu"
      })
    }

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated. Please sign in first.",
      route: "/signin"
    })

  }

})

app.get("/logout", (_, res) => {
  authenticated = false;

  res.render("success", {
    message: "You have logged out of your account.",
    route: "/"
  })

})

app.get("/selectQuestion", async (req, res) => {

  if (authenticated) {

    try {

      const questions = await ResearchData.find({researcherEmail: currentUserEmail})

      res.render("select-question", {
        questionList: questions
      })

    } catch (e) {
      console.log(e)
      res.redirect("/mainmenu")
    }

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated. Please sign in first.",
      route: "/signin"
    })

  }

})

app.get("/hashData", (req, res) => {

  if (authenticated) {



  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated. Please sign in first.",
      route: "/signin"
    })

  }

})

app.post("/selectQuestion", async (req, res) => {

  const questionId = req.body.selectedQuestion;

  try {

    const questionDoc = await ResearchData.findById(questionId);

    res.render("view-question-responses", {
      questionDocument: questionDoc
    })

  } catch (e) {
    console.log(e)
    res.redirect("/selectQuestion")
  }

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

  const userFullName = req.body.fullName;
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userOccupation = req.body.occupation;

  User.findOne({ email: currentUserEmail }, (err, returnedUser) => {

    // Email already exists
    if (returnedUser) {

      res.render("failure", {
        message: "An account with that email already exists. Please use another email.",
        route: "/signup"
      })

      // Email does not exist but error occurred somewhere
    } else {

      if (err) {

        console.log(err);

        res.render("failure", {
          message: "Something went wrong. Please try again.",
          route: "/signup"
        })

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
                res.render("success", {
                  message: "Account successfully created.",
                  route: "/mainmenu"
                })
              })
              .catch(err => {
                console.log(err);
                res.render("failure", {
                  message: "Something went wrong. Please try again.",
                  route: "/signup"
                })
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
      responses: []
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
    res.render("failure", {
      message: "Error submitting questions. Please try again.",
      route: "/submitResearchQuestions"
    })
  }

  res.render("success", {
    message: "Research questions submitted.",
    route: "/mainmenu"
  })

})

app.post("/addTestSubject", async (req, res) => {

  const testers = req.body.participants;

  try {

    const currentUser = await User.findOne({email: currentUserEmail})

    if (Array.isArray(testers)) {

      for (let i = 0; i < testers.length; i++) {
        await User.findOneAndUpdate({email: testers[i]}, { $addToSet: { researchers: currentUser}})
      }

    } else {

      await User.findOneAndUpdate({email: testers}, { $addToSet: { researchers: currentUser}})

    }

    res.render("success", {
      message: "Test subjects successfully added.",
      route: "/mainmenu"
    })

  } catch (e) {
    console.log(e)
    res.render("failure", {
      message: "Error adding test subjects. Please try again.",
      route: "/addTestSubject"
    })
  }

})

app.post("/viewResearchQuestions", async (req, res) => {

  const researcherEmail = req.body.selectedResearcher;

  try {

    const questions = await ResearchData.find({researcherEmail: researcherEmail})

    res.render("view-research-questions", {
      questionsData: questions
    })

  } catch (e) {
    console.log(e)
    res.redirect("/selectResearcher")
  }

})

app.post("/submitResearchAnswers", async (req, res) => {

  const questionIds = Object.keys(req.body);

  try {

    for (let i = 0; i < questionIds.length; i++) {

      const testerResponse = req.body[questionIds[i]]

      await ResearchData.findByIdAndUpdate(questionIds[i], { $push: { responses: testerResponse } })

    }

    res.render("success", {
      message: "Answers successfully submitted",
      route: "/mainmenu"
    })

  } catch (e) {

    console.log(e)
    res.render("failure", {
      message: "Submission error. Please try again",
      route: "/selectResearcher"
    })
  }

})

/*********** EXPORTS ************/

module.exports = app;
