// config/passport.js
				
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs'); // we will use this to salt and encrypt our passwords
var validator = require('validator');
var emailExistence = require('email-existence');

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

};
