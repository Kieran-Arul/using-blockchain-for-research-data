/*********** GENERAL SET-UP ************/

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { researchIsSharable, addResearchParticipant, changeSharingPreference, addResearchHash, getResearchHash } = require("./blockchainInterface.js")

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

let currentUser = null;

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
  }],
  testSubjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  reviewees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  allResponded: {
    type: Boolean,
    default: false
  },
  hasShared: {
    type: Boolean,
    default: false
  }

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

  if (currentUser) {

    res.render("main-menu", {
      occupation: currentUser.occupation
    })

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated. Please sign in first.",
      route: "/signin"
    })

  }

})

app.get("/addTestSubject", (req, res) => {

  if ((currentUser) && (currentUser.occupation === "Researcher")) {

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
      message: "This page is blocked as you are not yet authenticated or not a researcher.",
      route: "/signin"
    })

  }

})

app.get("/submitResearchQuestions", (_, res) => {

  if ((currentUser) && (currentUser.occupation === "Researcher")) {

    res.sendFile(__dirname + "/client/submit-research-questions/submit-research-questions.html")

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not authenticated or not a researcher.",
      route: "/signin"
    })

  }

})

app.get("/selectResearcher", async (req, res) => {

  if ((currentUser) && (currentUser.occupation === "Test Subject")) {

    try {

      const userWPopulatedResearchers = await currentUser.populate("researchers")

      res.render("select-researcher", {
        researcherList: userWPopulatedResearchers.researchers
      })

    } catch (e) {

      res.render("failure", {
        message: "Something went wrong.",
        route: "/mainmenu"
      })

    }

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated or not a test subject.",
      route: "/signin"
    })

  }

})

app.get("/logout", (_, res) => {

  currentUser = null;

  res.render("success", {
    message: "You have logged out of your account.",
    route: "/"
  })

})

app.get("/selectQuestion", async (req, res) => {

  if ((currentUser) && (currentUser.occupation === "Researcher")) {

    try {

      const questions = await ResearchData.find({researcherEmail: currentUser.email})

      res.render("select-question", {
        questionList: questions
      })

    } catch (e) {

      console.log(e);

      res.render("failure", {
        message: "Something went wrong.",
        route: "/mainmenu"
      })

    }

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated or not a researcher.",
      route: "/signin"
    })

  }

})

app.get("/downloadData", async (req, res) => {

  if ((currentUser) && (currentUser.occupation === "Researcher")) {

    console.time("Download Data")

    const allowedToShare = await researchIsSharable(currentUser._id);

    console.log("This data can be shared: " + allowedToShare);

    if ((currentUser.allResponded) && (allowedToShare)) {

      ResearchData.find({researcherEmail: currentUser.email}, (err, data) => {

        if (err) {

          console.log(err);

          res.render("failure", {
            message: "Something went wrong. Please try again.",
            route: "/mainmenu"
          })

        } else if (data) {

          const dataAsJson = JSON.stringify(data);

          fs.writeFile("output.json", dataAsJson, err => {

            if (err) {
              res.render("failure", {
                message: "Something went wrong when trying to download the file.",
                route: "/mainmenu"
              })
            }

            console.log("File created");

            const filePath = path.join(__dirname, "output.json");
            const fileStream = fs.createReadStream(filePath);

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=output.json');

            fileStream.pipe(res);

            res.on("finish", () => {

              fs.unlink(filePath, err => {

                if (err) {
                  console.log(err)
                }

                User.findByIdAndUpdate(currentUser._id, { hasShared: true })
                    .then(() => {
                      console.log("File deleted")
                      console.log("Researcher share status updated")
                      console.timeEnd("Download Data")
                    })
                    .catch(err => {
                      console.log(err);
                    })
              })

            });

          })

        }

      })

    } else {

      res.render("failure", {
        message: "You cannot share the data either because not all participants have responded or some participants do not want their data shared.",
        route: "/mainmenu"
      })

    }

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated or not a researcher.",
      route: "/signin"
    })

  }

})

app.get("/setSharingPreference", async (req, res) => {

  if ((currentUser) && (currentUser.occupation === "Test Subject")) {

    try {

      const userWPopulatedResearchers = await currentUser.populate("researchers")

      res.render("set-sharing-preference", {
        researcherList: userWPopulatedResearchers.researchers
      })

    } catch (e) {

      res.render("failure", {
        message: "Something went wrong.",
        route: "/mainmenu"
      })

    }

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated or not a test subject.",
      route: "/signin"
    })

  }

})

app.get("/addPeerReviewer", (req, res) => {

  if ((currentUser) && (currentUser.occupation === "Researcher")) {

    User.find({ occupation: "Peer Reviewer" }, (err, theReviewers) => {

      if (err) {

        console.log(err);

        res.render("failure", {
          message: "Something went wrong.",
          route: "/mainmenu"
        })

      } else {

        res.render("add-peer-reviewer", {
          reviewers: theReviewers
        })

      }

    })

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated or not a researcher.",
      route: "/signin"
    })

  }

})

app.get("/viewHash", async (req, res) => {

  if ((currentUser) && (currentUser.occupation === "Researcher") && (currentUser.allResponded)) {

    try {

      const storedHash = await getResearchHash(currentUser._id);

      const researcherData = await ResearchData.find({ researcherEmail: currentUser.email });

      const dataAsJson = JSON.stringify(researcherData);

      const calculatedHash = crypto.createHash("sha256").update(dataAsJson).digest("hex");

      if (storedHash === calculatedHash) {

        res.render("success", {
          message: "The stored hash is: " + storedHash + " and the calculated hash is: " + calculatedHash,
          route: "/mainmenu"
        })

      } else {

        res.render("failure", {
          message: "The hashes do not match. The stored hash is: " + storedHash + " and the calculated hash is: " + calculatedHash,
          route: "/mainmenu"
        })

      }

    } catch (e) {

      console.log(e);

      res.render("failure", {
        message: "Something went wrong.",
        route: "/mainmenu"
      })

    }

  } else {

    res.render("failure", {
      message: "You may not be authenticated. Your test subjects may not have all responded yet as well, thus the hash may not exist yet.",
      route: "/mainmenu"
    })

  }

})

app.get("/verifyDataIntegrity", async (req, res) => {

  if ((currentUser) && (currentUser.occupation === "Peer Reviewer")) {

    try {

      const userWPopulatedReviewees = await currentUser.populate("reviewees")

      res.render("verify-data-integrity", {
        researcherList: userWPopulatedReviewees.reviewees
      })

    } catch (e) {

      res.render("failure", {
        message: "Something went wrong.",
        route: "/mainmenu"
      })

    }

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated or not a peer reviewer.",
      route: "/signin"
    })

  }

})

app.get("/verifyDataPrivacy", async (req, res) => {

  if ((currentUser) && (currentUser.occupation === "Peer Reviewer")) {

    try {

      const userWPopulatedReviewees = await currentUser.populate("reviewees")

      res.render("verify-data-privacy", {
        researcherList: userWPopulatedReviewees.reviewees
      })

    } catch (e) {

      res.render("failure", {
        message: "Something went wrong.",
        route: "/mainmenu"
      })

    }

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated or not a peer reviewer.",
      route: "/signin"
    })

  }

})

/*********** API POST ENDPOINTS ************/

app.post("/addPeerReviewer", async (req, res) => {

  const peerReviewers = req.body.reviewers;

  try {

    if (Array.isArray(peerReviewers)) {

      for (let i = 0; i < peerReviewers.length; i++) {

        await User.findByIdAndUpdate(peerReviewers[i], { $addToSet: { reviewees: currentUser}})

      }

    } else {

      await User.findByIdAndUpdate(peerReviewers, { $addToSet: { reviewees: currentUser}})

    }

    res.render("success", {
      message: "Peer Reviewers successfully added.",
      route: "/mainmenu"
    })

  } catch (e) {

    console.log(e)
    res.render("failure", {
      message: "Error adding peer reviewers. Please try again.",
      route: "/addPeerReviewer"
    })

  }

})

app.post("/verifyDataIntegrity", async (req, res) => {

  console.time("Verify Data Integrity");

  if ((currentUser) && (currentUser.occupation === "Peer Reviewer")) {

    try {

      const researcherId = req.body.selectedResearcher;
      const researcherObject = await User.findById(researcherId);

      if (!researcherObject.allResponded) {

        res.render("failure", {
          message: "Unable to view hash. Not all participants have responded to the researcher yet.",
          route: "/mainmenu"
        })

      }

      const researcherData = await ResearchData.find({ researcherEmail: researcherObject.email });

      const dataAsJson = JSON.stringify(researcherData);

      const calculatedHash = crypto.createHash("sha256").update(dataAsJson).digest("hex");

      const storedHash = await getResearchHash(researcherObject._id);

      if (calculatedHash === storedHash) {

        console.timeEnd("Verify Data Integrity");

        res.render("success", {
          message: "The stored and calculated hashes match. The stored hash is: " + storedHash + " and the calculated hash is: " + calculatedHash,
          route: "/mainmenu"
        })

      } else {

        res.render("failure", {
          message: "The hashes do not match. The stored hash is: " + storedHash + " and the calculated hash is: " + calculatedHash,
          route: "/mainmenu"
        })

      }

    } catch (e) {

      console.log(e);

      res.render("failure", {
        message: "Something went wrong.",
        route: "/mainmenu"
      })

    }

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated or not a peer reviewer.",
      route: "/signin"
    })

  }

})

app.post("/verifyDataPrivacy", async (req, res) => {

  console.time("Verify Data Privacy");

  if ((currentUser) && (currentUser.occupation === "Peer Reviewer")) {

    try {

      const researcherId = req.body.selectedResearcher;
      const researcherObject = await User.findById(researcherId);

      if (!researcherObject.allResponded) {

        res.render("failure", {
          message: "Unable to view hash. Not all participants have responded to the researcher yet.",
          route: "/mainmenu"
        })

      }

      const dataWasShared = researcherObject.hasShared;
      const dataWasSharable = researchIsSharable(researcherObject._id);

      if ((dataWasShared === dataWasSharable) || (dataWasSharable)) {

        console.timeEnd("Verify Data Privacy")

        res.render("success", {
          message: "Data privacy was respected",
          route: "/mainmenu"
        })

      } else {

        res.render("failure", {
          message: "The data was shared but this was not authorized by the research participants",
          route: "/mainmenu"
        })

      }

    } catch (e) {

      console.log(e);

      res.render("failure", {
        message: "Something went wrong.",
        route: "/mainmenu"
      })

    }

  } else {

    res.render("failure", {
      message: "This page is blocked as you are not yet authenticated or not a peer reviewer.",
      route: "/signin"
    })

  }

})

app.post("/setSharingPreference", async (req, res) => {

  try {

    console.time("Set Sharing Preference");

    const researcherId = req.body.selectedResearcher;
    const sharingPreference = req.body.sharingPreference === "true";

    console.log("Sharing preference selected is: " + sharingPreference);

    const researcherDocument = await User.findById(researcherId);

    await changeSharingPreference(researcherDocument._id, currentUser._id, sharingPreference);

    console.timeEnd("Set Sharing Preference")

    res.render("success", {
      message: "Your preference has been saved to the blockchain.",
      route: "/mainmenu"
    })

  } catch (e) {

    res.render("failure", {
      message: "Something went wrong. Please Try Again",
      route: "/setSharingPreference"
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

    res.render("failure", {
      message: "Something went wrong. Please try again.",
      route: "/selectQuestion"
    })

  }

})

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

          currentUser = returnedUser;
          res.redirect("/mainmenu");

        } else {

          res.render("failure", {
            message: "Something went wrong.",
            route: "/signin"
          })

        }

      })

    } else {
      res.render("failure", {
        message: "Incorrect email or password.",
        route: "/signin"
      })
    }

  })

})

app.post("/signup", (req, res) => {

  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFullName = req.body.fullName;
  const userOccupation = req.body.occupation;

  User.findOne({ email: userEmail }, (err, returnedUser) => {

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
            fullName: userFullName,
            researchers: [],
            testSubjects: [],
            reviewees: [],
            allResponded: false,
            hasShared: false
          });

          newUser.save()
              .then(() => {

                User.findOne({ email: userEmail}, (err, currUser) => {

                  if (err) {

                    res.render("failure", {
                      message: "Something went wrong. Please try again.",
                      route: "/signin"
                    })

                  } else if (currUser) {

                    currentUser = currUser;

                    res.render("success", {
                      message: "Account successfully created.",
                      route: "/mainmenu"
                    })

                  } else {

                    res.render("failure", {
                      message: "Sign up failed. Please try again.",
                      route: "/signup"
                    })

                  }

                })


              })
              .catch(err => {

                console.log(err);

                res.render("failure", {
                  message: "Sign up failed. Please try again.",
                  route: "/signup"
                })

              });

        })

      }

    }

  });

})

app.post("/submitResearchQuestions", (req, res) => {

  Object.keys(req.body).forEach(key => {

    const newResearch = new ResearchData({
      researcherEmail: currentUser.email,
      title: req.body[key],
      responses: []
    })

    newResearch.save()
        .then(() => {
          console.log("Successfully saved research question");
        })
        .catch(err => {

          console.log(err);

          res.render("failure", {
            message: "Error submitting questions. Please try again.",
            route: "/submitResearchQuestions"
          })

        })

  })

  res.render("success", {
    message: "Research questions submitted.",
    route: "/mainmenu"
  })

})

app.post("/addTestSubject", async (req, res) => {

  const testers = req.body.participants;

  await User.findOneAndUpdate({email: currentUser.email}, { allResponded: false })

  try {

    if (Array.isArray(testers)) {

      for (let i = 0; i < testers.length; i++) {

        await User.findOneAndUpdate({email: testers[i]}, { $addToSet: { researchers: currentUser}})

        let currentParticipant = await User.findOne({email: testers[i]})

        await User.findOneAndUpdate({email: currentUser.email}, { $addToSet: { testSubjects: currentParticipant}})

        // Default false sharing preference
        await addResearchParticipant(currentUser._id, currentParticipant._id);

      }

    } else {

      await User.findOneAndUpdate({email: testers}, { $addToSet: { researchers: currentUser}})

      let currentParticipant = await User.findOne({email: testers})

      await User.findOneAndUpdate({email: currentUser.email}, { $addToSet: { testSubjects: currentParticipant}})

      await addResearchParticipant(currentUser._id, currentParticipant._id);

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

    let firstQuestion = await ResearchData.findById(questionIds[0]);
    const questionnaireOwnerEmail = firstQuestion.researcherEmail;
    const questionnaireOwner = await User.findOne({email: questionnaireOwnerEmail});
    const numTestSubjects = questionnaireOwner.testSubjects.length;

    console.log("Number of test subjects: " + numTestSubjects);

    for (let i = 0; i < questionIds.length; i++) {

      const testerResponse = req.body[questionIds[i]]

      await ResearchData.findByIdAndUpdate(questionIds[i], { $push: { responses: testerResponse } })

    }

    firstQuestion = await ResearchData.findById(questionIds[0]);

    if (firstQuestion.responses.length === numTestSubjects) {

      console.time("Add Hash");

      await User.findOneAndUpdate({email: questionnaireOwnerEmail}, { allResponded: true })
      console.log("All participants responded");

      const researchData = await ResearchData.find({ researcherEmail: questionnaireOwnerEmail });

      const dataAsJson = JSON.stringify(researchData);

      const hash = crypto.createHash("sha256").update(dataAsJson).digest("hex");

      await addResearchHash(questionnaireOwner._id, hash);

      console.timeEnd("Add Hash");

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
