const jwt = require("jwt-simple");
const config = require("../config");
const User = require("../models/user");

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}
exports.signin = function(req, res, next) {
  //user has already had their email and password auth'd
  // we just need to give them a token
  res.send({ token: tokenForUser(req.user) });
};
exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res
      .status(422)
      .send({ error: "You must provide email and password" });
  }
  // see if a user with the given email exists
  User.findOne({ email: email }, function(err, existingUser) {
    // if a user with email does exist, return an error
    if (err) {
      return next(err);
    }

    if (existingUser) {
      return res.status(422).send({ error: "Email is in use." });
    }
    // if a user with email does NOT exist, create and save user record
    const user = new User({ email: email, password: password });
    user.save(function(err) {
      if (err) {
        return next(err);
      }
      res.json({ token: tokenForUser(user) });
    });
  });

  // Respond to request indicating the user was created
};
