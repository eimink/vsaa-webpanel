// server.js


var express  = require('express');
var app      = express();

var passport = require('passport');
var flash    = require('connect-flash');

global.config = require('./config/config');
global.db = require("./app/databases/"+config.db_driver);

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms

	app.set('view engine', 'ejs'); // set up ejs for templating

	// required for passport
	app.use(express.session({ secret: 'verysimpleappanalyticsftw' } )); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(config.listen);
console.log('vsaa-webpanel running on port ' + config.listen);
