// config/passport.js
				
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var bcrypt = require('bcrypt-nodejs'); // we will use this to salt and encrypt our passwords
var validator = require('validator');
var emailExistence = require('email-existence');

// load the auth configuration
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
		done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {

		db.getUserById(id,function(err,rows){
			done(err, rows[0]);
		});
    });

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

		if (!validator.isEmail(email)) {
			return done(null, false, req.flash('signupMessage', 'That email is not valid.'));
		}
		emailExistence.check(email, function(err,res){
			if (!res)
				return done(null, false, req.flash('signupMessage', 'That email does not exist.'));
			// find a user whose email is the same as the forms email
			// we are checking to see if the user trying to login already exists
			db.getUser(email,function(err,rows){
				if (err)
					return done(err);
				 if (rows.length) {
					return done(null, false, req.flash('signupMessage', 'That email is already registered.'));
				} else {

					// if there is no user with that email
					// create the user
					var salt = bcrypt.genSaltSync(10);
					var newUserMysql = new Object();
					newUserMysql.email    = email;
					newUserMysql.password = bcrypt.hashSync(password, salt);
					newUserMysql.salt = salt;
					db.createUser(newUserMysql,function(err,res){
						if(err){
							console.log(err);
							return done(null, false);
						}
						newUserMysql.id = res.insertId;
						return done(null, newUserMysql);
					});
				}	
			});
     	});		
    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

         db.getUser(email,function(err,rows){
			if (err)
                return done(err);
			 if (!rows.length) {
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            } 
			
			// if the user is found but the password is wrong
            if (!( rows[0].password == bcrypt.hashSync(password, rows[0].salt)))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
			
            // all is well, return successful user
            return done(null, rows[0]);			
		
		});
		
    }));
    
    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

		// pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

		// asynchronous
		process.nextTick(function() {

			// find the user in the database based on their facebook id
			db.getUserByFB(profile.id ,function(err,rows){

	        	// if there is an error, stop everything and return that
	        	// ie an error connecting to the database
	            if (err)
	                return done(err);

				// if the user is found, then log them in
	            if (rows.length) {
	                return done(null, user); // user found, return that user
	            } else {
	                // if there is no user found with that facebook id, create them
	                var newUser            = new Object();
	                newUser.facebook = new Object();
	                
					var salt = bcrypt.genSaltSync(10);
					// set all of the facebook information in our user model
	                newUser.facebook.id    = profile.id; // set the users facebook id	                
	                newUser.facebook.token = token; // we will save the token that facebook provides to the user	                
	                newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
	                newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
					newUser.email    = newUser.facebook.email;
					newUser.password = bcrypt.hashSync(token, salt);
					newUser.salt = salt;
					// save our user to the database
	                db.createUser(newUser,function(err,res){
						if(err){
							console.log(err);
							return done(null, false);
						}
						newUser.id = res.insertId;
						return done(null, newUser);
					});
	            }

	        });
        });

    }));

};
