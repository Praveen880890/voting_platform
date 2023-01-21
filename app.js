const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const { AdminCreate,
        election,
        options,
        question,
        voter,
      answers } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
app.use(express.static(path.join(__dirname, "/public")));
const bcrypt = require("bcrypt");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const flash = require("connect-flash");
const LocalStratergy = require("passport-local");
const saltRounds = 10;
app.set("views", path.join(__dirname, "views"));
app.use(flash());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("Some secret String"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.use(
  session({
    secret: "my-super-secret-key-2837428907583420",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use((request, response, next) => {
  response.locals.messages = request.flash();
  next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStratergy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      AdminCreate.findOne({ where: { email: username } })
        .then(async (user) => {
          const val = await bcrypt.compare(password, user.password);
          if (val) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch(() => {
          return done(null, false, { message: "Invalid Email-ID" });
        });
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  AdminCreate.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});
app.set("view engine", "ejs");
app.get("/", (request, response) => {
  if (request.user) {
    return response.redirect("/election");
  } else {
    response.render("index", {
      title: "Online Voting Platform",
    });
  }
});
app.get(
  "/election",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
      let username = request.user.firstName +" "+ request.user.lastName;
      try {
        const elections = await election.getElections(request.user.id);
        if (request.accepts("html")) {
          response.render("election", {
            title: "Online Voting Platform",
            username,
            elections,
            csrfToken: request.csrfToken(),
          });
        } else {
          return response.json({
            elections,
          });
        }
      } catch (error) {
        console.log(error);
        return response.status(422).json(error);
      }
    } 
);
app.get("/signup", (request, response) => {
  console.log(request.csrfToken())
  response.render("signup", {
    title: "Admin Create a new account",
    csrfToken: request.csrfToken(),
  });
});
app.get("/login", (request, response) => {
  response.render("login", {
    title: "Login to your account",
    csrfToken: request.csrfToken(),
  });
});
app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});
app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    response.redirect("/election");
  }
);
app.get(
  "/pswdReset",
  connectEnsureLogin.ensureLoggedIn(),
  (request, response) => {
    response.render("pswdReset", {
      title: "Reset your password",
      csrfToken: request.csrfToken(),
    });
  }
);
app.post(
  "/pswdReset",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    if (!request.body.old_password) {
      request.flash("error", "Please enter your old password");
      return response.redirect("/pswdReset");
    }
    if (!request.body.new_password) {
      request.flash("error", "Please enter the new password");
      return response.redirect("/pswdReset");
    }
    if (request.body.new_password.length < 8) {
      request.flash("error", "Password length should be atleast 8 characters  length");
      return response.redirect("/pswdReset");
    }
    const newPassword = await bcrypt.hash(
      request.body.new_password,
      saltRounds
    );
    const val = await bcrypt.compare(
      request.body.old_password,
      request.user.password
    );
    if (val) {
      AdminCreate.findOne({ where: { email: request.user.email } }).then((user) => {
        user.resetPass(newPassword);
      });
      request.flash("success", "Password changed successfully");
      return response.redirect("/election");
    } else {
      request.flash("error", "Old password does not match");
      return response.redirect("/pswdReset");
    }
  }
);
app.post("/admin", async (request, response) => {
  const Pwd = await bcrypt.hash(request.body.password, saltRounds);
  try {
    const admin = await AdminCreate.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: Pwd,
    
    });
    console.log("hgfgfdjgdjthgfjhg");
    request.login(admin, (err) => {
      if (err) {
        console.log("zqwwwwwwwwwwwwwwwq");
        return response.redirect("/");
      } else {
        return response.redirect("/election");
      }
    });
  } catch (error){
    request.flash("error", error.message);
    return response.redirect("/signup");
  }
});
app.get(
  "/election/createNew",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    response.render("NewElection", {
      title: "New Election",
      csrfToken: request.csrfToken(),
    });
  }
);
app.post(
  "/election",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    function whiteSpaces(value) {
      return value.indexOf(" ") >= 0;
    }
      if (request.body.elecName.length < 5) {
        request.flash("error", "Election name length should be a minimum of 5");
        return response.redirect("/election/createNew");
      }
      if (request.body.cstmUrl.length < 5) {
        request.flash("error", "URL String length should be a minimum of 5");
        return response.redirect("/election/createNew");
      }
      const strUrl = request.body.cstmUrl
      const isWhiteScape = whiteSpaces(strUrl)
      if(isWhiteScape == true){
        request.flash("error","Don't enter any white spaces");
        console.log("Spaces found");
        return response.redirect("/election/createNew");
      }
      try {
        console.log("asdfads");
        console.log(request.body.elecName);
        console.log(request.body.cstmUrl);
        console.log(request.user.id);
        await election.addElection({
          elecName: request.body.elecName,
          cstmUrl: request.body.cstmUrl,
          adminID: request.user.id,
        });
        console.log("bbbbbbbb");
        return response.redirect("/election");
      } 
      catch (error) {
        console.log(error);
        request.flash("error", "Election URL is already in use");
        return response.redirect("/election/createNew");
      }
  }
);
app.get(
  "/election/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
      try {
        const thiselection = await election.getElection(request.params.id);
        if (request.user.id !== thiselection.adminID){
          request.flash("error", "Invalid election ID");
          return response.redirect("/election");
        }
        if (thiselection.ended) {
          return response.redirect(`/election/${election.id}/results`);
        }
        const numberOfQuestions = await question.getNumberOfQuestions(
          request.params.id
        );
        const numberOfVoters = await voter.getNumberOfVoters(request.params.id);
        return response.render("ElectionOptions", {
          id: request.params.id,
          title: thiselection.elecName,
          cstmUrl: thiselection.cstmUrl,
          Running: thiselection.Running,
          noQuestions: numberOfQuestions,
          noVoters: numberOfVoters,
          csrfToken: request.csrfToken(),
        });
      } catch (error) {
        console.log(error);
        return response.status(422).json(error);
      }
    }
);
app.get(
  "/election/:id/questions",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
      try {
        const thiselection = await election.getElection(request.params.id);
        if (request.user.id!==thiselection.adminID) {
          request.flash("error", "Invalid election ID");
          return response.redirect("/elections");
        }
        const thisquestions = await question.gtQuestns(request.params.id);
        if (!thiselection.Running && !thiselection.Ended) {
          if (request.accepts("html")) {
            return response.render("questions", {
              title: thiselection.elecName,
              id: request.params.id,
              thisquestions: thisquestions,
              csrfToken: request.csrfToken(),
            });
          } else {
            return response.json({
              ElectionOptions,
            });
          }
        } else {
          if (thiselection.ended) {
            request.flash("error", "Cannot edit when election has ended");
          } else if (thiselection.running) {
            request.flash("error", "Cannot edit while election is running");
          }
          return response.redirect(`/election/${request.params.id}/`);
        }
      } catch (error) {
        console.log(error);
        return response.status(422).json(error);
      }
    }
);
app.post(
  "/election/:id/questions/create",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
      if (request.body.question.length < 5) {
        request.flash("error", "Question length should be atleast 5");
        return response.redirect(
          `/election/${request.params.id}/questions/create`
        );
      }
      try {
        const thiselection = await election.getElection(request.params.id);
        if (request.user.id !== thiselection.adminID) {
          request.flash("error", "Invalid election ID");
          return response.redirect("/election");
        }
        if (thiselection.Running) {
          request.flash("error", "Can't the question edit while election is running");
          return response.redirect(`/election/${request.params.id}/`);
        }
        if (thiselection.Ended) {
          request.flash("error", "Cannot edit when election has ended");
          return response.redirect(`/election/${request.params.id}/`);
        }
        const thisquestion = await question.addQuestions({
          elecQuestion: request.body.question,
          elecDescription: request.body.description,
          electionID: request.params.id,
        });
        return response.redirect(
          `/election/${request.params.id}/questions/${thisquestion.id}`
        );
      } catch (error) {
        console.log(error);
        return response.status(422).json(error);
      }
    }
);

app.get(
  "/election/:id/questions/create",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
      try {
        const thiselection = await election.getElection(request.params.id);
        if (request.user.id !== thiselection.adminID) {
          request.flash("error", "Invalid election ID");
          return response.redirect("/election");
        }
        if (!thiselection.Running) {
          return response.render("NewQuestion", {
            id: request.params.id,
            title:thiselection.elecName,
            csrfToken: request.csrfToken(),
          });
        } else {
          if (thiselection.Ended) {
            request.flash("error", "Cannot edit when election has ended");
            return response.redirect(`/election/${request.params.id}/`);
          }
          request.flash("error", "Cannot edit while election is running");
          return response.redirect(`/election/${request.params.id}/`);
        }
      } catch (error) {
        console.log(error);
        return response.status(422).json(error);
      }
    }
);
app.get(
  "/election/:id/questions/:questionID",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
      try {
        const thisquestion = await question.gtQuestns(request.params.id);
        const thisoptions = await options.gtOptns(request.params.questionID);
        const thiselection = await election.getElection(request.params.id);
        if (request.user.id !== thiselection.adminID) {
          request.flash("error", "Invalid election ID");
          return response.redirect("/elections");
        }
        if (thiselection.Running) {
          request.flash("error", "Cannot edit while election is running");
          return response.redirect(`/elections/${request.params.id}/`);
        }
        if (thiselection.Ended) {
          request.flash("error", "Cannot edit when election has ended");
          return response.redirect(`/elections/${request.params.id}/`);
        }
        if (request.accepts("html")) {
          response.render("questionPage", {
            title: thisquestion.question,
            description: thisquestion.description,
            id: request.params.id,
            questionID: request.params.questionID,
            thisoptions,
            csrfToken: request.csrfToken(),
          });
        } else {
          return response.json({
            options,
          });
        }
      } catch (error) {
        console.log(error);
        return response.status(422).json(error);
      }
    }
);
app.post(
  "/election/:id/questions/:questionID",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
      if (!request.body.option) {
        request.flash("error", "Please enter option");
        return response.redirect(
          `/election/${request.params.id}/questions/${request.params.questionID}`
        );
      }
      try {
        const thiselection = await election.getElection(request.params.id);
        if (request.user.id !== thiselection.adminID) {
          request.flash("error", "Invalid election ID");
          return response.redirect("/election");
        }
        if (thiselection.Running) {
          request.flash("error", "Cannot edit while election is running");
          return response.redirect(`/election/${request.params.id}/`);
        }
        if (thiselection.Ended) {
          request.flash("error", "Cannot edit when election has ended");
          return response.redirect(`/elections/${request.params.id}/`);
        }
        await options.addOption({
          option: request.body.option,
          questionID: request.params.questionID,
        });
        return response.redirect(
          `/election/${request.params.id}/questions/${request.params.questionID}`
        );
      } catch (error) {
        console.log(error);
        return response.status(422).json(error);
      }
    }
);
app.get(
  "/election/:electionID/questions/:questionID/edit",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
      try {
        const thiselection = await election.getElection(request.params.id);
        if (request.user.id !== thiselection.adminID) {
          request.flash("error", "Invalid election ID");
          return response.redirect("/elections");
        }
        if (thiselection.Running) {
          request.flash("error", "Cannot edit while election is running");
          return response.redirect(`/elections/${request.params.id}/`);
        }
        if (thiselection.Ended) {
          request.flash("error", "Cannot edit when election has ended");
          return response.redirect(`/elections/${request.params.id}/`);
        }
        const thisquestion = await question.gtQuestn(request.params.questionID);
        return response.render("editquestion", {
          electionID: request.params.electionID,
          questionID: request.params.questionID,
          questionTitle: thisquestion.question,
          questionDescription: thisquestion.description,
          csrfToken: request.csrfToken(),
        });
      } catch (error) {
        console.log(error);
        return response.status(422).json(error);
      }
    }
);
app.put(
  "/election/:electionID/questions/:questionID/edit",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
      if (request.body.question.length < 5) {
        request.flash("error", "Question length should be atleast 5");
        return response.json({
          error: "Question length should be atleast 5",
        });
      }
      try {
        const thiselection = await election.getElection(request.params.electionID);
        if (thiselection.Running) {
          return response.json("Cannot edit while election is running");
        }
        if (thiselection.Ended) {
          return response.json("Cannot edit when election has ended");
        }
        if (request.user.id !== thiselection.adminID) {
          return response.json({
            error: "Invalid Election ID",
          });
        }
        const updatedQuestion = await question.updateQuestion({
          question: request.body.elecQuestion,
          description: request.body.elecDescription,
          id: request.params.questionID,
        });
        return response.json(updatedQuestion);
      } catch (error) {
        console.log(error);
        return response.status(422).json(error);
      }
    }
);
app.get(
  "/elections/:electionID/voters",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
      try {
        const thisvoters = await voter.getVoters(request.params.electionID);
        const thiselection = await election.getElection(request.params.electionID);
        if (thiselection.Ended) {
          request.flash("error", "Cannot edit when election has ended");
          return response.redirect(`/elections/${request.params.electionID}/`);
        }
        if (request.user.id !== thiselection.adminID) {
          request.flash("error", "Invalid election ID");
          return response.redirect("/elections");
        }
        if (request.accepts("html")) {
          return response.render("voters", {
            title: election.elecName,
            id: request.params.electionID,
            thisvoters,
            csrfToken: request.csrfToken(),
          });
        } else {
          return response.json({
            thisvoters,
          });
        }
      } catch (error) {
        console.log(error);
        return response.status(422).json(error);
      }
    }
);
app.get(
  "/election/:electionID/voters/create",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
      try {
        const thiselection = await election.getElection(request.params.electionID);
        if (request.user.id !== thiselection.adminID) {
          request.flash("error", "Invalid election ID");
          return response.redirect("/elections");
        }
        if (thiselection.Ended) {
          request.flash("error", "Cannot edit when election has ended");
          return response.redirect(`/elections/${request.params.electionID}/`);
        }
        response.render("newvoter", {
          title: "Add a voter to election",
          electionID: request.params.electionID,
          csrfToken: request.csrfToken(),
        });
      } catch (error) {
        console.log(error);
        return response.status(422).json(error);
      }
    }
);
module.exports = app;