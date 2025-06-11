const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/User");
require("dotenv").config();

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          const user = await User.findById(jwtPayload.id);
          return user ? done(null, user) : done(null, false);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
};
