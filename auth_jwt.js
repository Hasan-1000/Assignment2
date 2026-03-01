var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

db = require('./db')();   // REQUIRED so db.find works

var opts = {};

// IMPORTANT: Must match the prefix returned in /signin
// Your /signin returns: 'JWT ' + token
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("JWT");

opts.secretOrKey = process.env.SECRET_KEY;

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    var user = db.find(jwt_payload.id);

    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}));

exports.isAuthenticated = passport.authenticate('jwt', { session: false });
exports.secret = opts.secretOrKey;