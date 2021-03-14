const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const { User } = require('../database/associations');

// Authenticate user
const authenticate = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email: email } }); // Find user

        // Check if user exists
        if (!user) {
          return done(null, false, { message: 'Incorrect email' });
        }
  
        // Compare password
        if (await bcrypt.compare(password, user.password)) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect password' });
        }
      } catch (err) {
        return done(err);
      }
    })
  )

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    User.findOne({
      where: {
        id: id,
      },
    }).then((user) => {
      done(null, user);
    });
  });
};

module.exports = authenticate;