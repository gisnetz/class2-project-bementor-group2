const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../model/user.model");
const { isUserLoggedIn, isUser, decodeToken } = require("./user.auth");
const {
  handleClientOk,
  handleServerError,
  handleUserError,
  handleLoginRequired,
  handleInvalidAccess
} = require("./common-handlers");

// const nodemailer = require("nodemailer");

const { JWT_SECRET } = process.env;

//generate jsonwebtoken
const generateJWT = payload => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "3 days" });
};

// Allow to search for a text case insensitive
const containNoCaseHandler = text => new RegExp(text, "i");

exports.findAll = (req, res) => {
  console.log("Cookie", req.cookies);
  User.find()
    .then(users => res.send(users))
    .catch(err => handleServerError(err, res));
};

exports.update = (req, res) => {
  if (!isUser(req, req.body._id)) {
    return handleInvalidAccess(req, res);
  }

  const { password } = req.body;
  if (password) {
    hash = bcrypt.hashSync(password, 10);
    req.body.password = hash;
  } else {
    delete req.body.password;
  }

  User.findByIdAndUpdate({ _id: req.body._id }, req.body)
    .then(() => handleClientOk(res, "User info was updated"))
    .catch(err => handleServerError(err, res));
};

exports.delete = (req, res) => {
  if (!isUser(req, req.params.id)) {
    return handleInvalidAccess(req, res);
  }

  User.findOneAndDelete({ _id: req.params.id })
    .then(() => handleClientOk(res, "User was deleted"))
    .catch(err => handleServerError(err, res));
};

exports.findUser = (req, res) => {
  User.findById(req.params._id)
    .then(user => res.send(user))
    .catch(err => handleServerError(err, res));
};

exports.getLoggedUserDetails = (req, res) => {
  let decodedToken = decodeToken(req, res);

  if (!decodedToken) {
    return handleLoginRequired(req, res);
  }

  User.findById(decodedToken._id)
    .then(user => res.send(user))
    .catch(err => handleServerError(err, res));
};

exports.create = (req, res) => {
  const users = new User(req.body);
  users
    .save()
    .then(user => res.send(user))
    .catch(err => handleServerError(err, res));
};

exports.search = (req, res) => {
  const searchParams = {};

  // q is the text to be searched for, as in google.com?q=potato
  if (req.query.q) {
    searchParams["$text"] = {
      $search: req.query.q
    };
  }

  if (req.query.location) {
    searchParams["location"] = containNoCaseHandler(req.query.location);
  }

  User.find(searchParams)
    .then(users => res.send(users))
    .catch(err => handleError(err, res));
};

//Register users
exports.register = async (req, res) => {
  //form validation
  const { password, email, lastName, firstName } = req.body;
  const existsUser = await User.findOne({ email });
  if (existsUser) {
    return handleUserError(res, "Email is already in use", 403);
  }
  if (!firstName || !lastName || !email || !password) {
    return handleUserError(res, "Please enter all fields", 401);
  }
  if (password.length < 8) {
    return handleUserError(res, "Password must be at least 8 characters", 401);
  }
  const pattern = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@[*[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+]*/;
  if (!pattern.test(email)) {
    return handleUserError(res, "Please provide a valid email address", 401);
  }
  bcrypt
    .hash(password, 10)
    .then(hash => {
      const user = new User({
        ...req.body,
        password: hash
      });
      return user.save();
    })
    .then(user => {
      res.status(201).send({
        message: "Your account has been created successfully"
      });
    })
    .catch(err => {
      handleServerError(err, res);
    });
};

exports.login = (req, res) => {
  let foundUser = null;
  User.findOne({ email: req.body.email })
    .select("+password")
    .then(user => {
      foundUser = user;
      const storedHash = user.password;
      return bcrypt.compare(req.body.password, storedHash);
    })
    .then(authenticationSuccessfull => {
      if (!authenticationSuccessfull) {
        return handleUserError(res, "Incorrect email or password", 401);
      }
      let token = generateJWT({ _id: foundUser._id });
      if (token) {
        res.cookie("token", token);
        handleClientOk(res, "Login successful", { token });
      } else {
        handleUserError(res, "Invalid token", 401);
      }
    });
};

function calculateRanking(scores) {
  const totalScore = scores.reduce(
    (accumulated, currentArrayValue) => accumulated + currentArrayValue,
    0
  );
  return Math.round(totalScore / scores.length);
}

// User Rankings
exports.updateRanking = (req, res) => {
  if (!isUserLoggedIn(req)) {
    return handleLoginRequired(req, res);
  }

  const newScore = req.body.score;
  User.findById({ _id: req.params.id })
    .then(user => {
      // Prevent errors with previously created users
      if (!user.scores) {
        user.scores = [];
      }
      user.scores.push(newScore);
      user.ranking = calculateRanking(user.scores);

      user
        .save()
        .then(() =>
          handleClientOk(res, "User ranking and scores were updated", {
            user: {
              ranking: user.ranking,
              scores: user.scores
            }
          })
        )
        .catch(err => handleServerError(err, res));
    })
    .catch(err => handleServerError(err, res));
};

exports.updateSkillLevel = (req, res) => {
  if (!isUser(req, req.params.id)) {
    return handleInvalidAccess(req, res);
  }

  console.log("req.params", req.params);
  const { skillName, level } = req.body;

  User.findById({ _id: req.params.id })
    .then(user => {
      // Prevent errors with previously created users
      if (!user.skills) {
        user.skills = [];
      }

      const skill = user.skills.find(s => s.name == skillName);
      if (skill) {
        skill.level = level;
      } else {
        skills.push({ skillName, level });
      }

      user
        .save()
        .then(() =>
          res.json({
            skills: user.skills
          })
        )
        .catch(err => handleServerError(err, res));
    })
    .catch(err => handleServerError(err, res));
};

exports.deleteManyProf = (req, res) => {
  console.log(req.params.qty);
  User.remove({})
    .then(() => res.json({ message: "Users were deleted" }))
    .catch(err => handleServerError(err, res));
};
