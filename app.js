const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const { AdminCreate,
        election,
        options,
        question,
        voter } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
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
//Initializing passport
app.use(passport.initialize());
app.use(passport.session());
//using passport for authentication
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
app.use(express.static(path.join(__dirname, "public")));


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
            election,
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
    request.login(admin, (err) => {
      if (err) {
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
        await election.addElection({
          elecName: request.body.elecName,
          cstmUrl: request.body.cstmUrl,
          id: request.user.id,
        });
        return response.redirect("/election");
      } catch (error) {
        request.flash("error", "Election URL is already in use");
        return response.redirect("/election/createNew");
      }
  }
);
module.exports = app;