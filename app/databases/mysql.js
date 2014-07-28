// Database related
'use strict';

var mysql   = require('mysql')
  , dbconnection = mysql.createConnection(config.mysql);
dbconnection.connect(function(err) {
  // connected! (unless `err` is set)
  if (err) {
    console.log("Error while connecting to database.");
  } else {
    console.log("Database connection successful.");
  }
});



function handleDisconnect(dbconnection) {
  dbconnection.on('error', function(err) {
    if (!err.fatal) {
      return;
    }

    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }

    console.log('Re-connecting lost connection: ' + err.stack);

    dbconnection = mysql.createConnection(dbconnection.config);
    handleDisconnect(dbconnection);
    dbconnection.connect();
  });
}

handleDisconnect(dbconnection);

exports.createUser = function (data, callback) {
	// Inserting our data and making sure it goes under correct app by FK
	console.log(data);
	var sql = 'INSERT INTO Users SET email =' + dbconnection.escape(data['email']) +
			  ',password = '+ dbconnection.escape(data['password']) +
			  ',salt = '+ dbconnection.escape(data['salt']);
	dbconnection.query(sql, function(err,res) {
		if (data.facebook)
		{
			var sql = 'INSERT INTO FB_Users SET Users_id = '+ dbconnection.escape(res.insertId) +
				',Facebook_id = '+ dbconnection.escape(data.facebook['id']) +
				',email =' + dbconnection.escape(data['email']) +
				',Token = '+ dbconnection.escape(data.facebook['token']) +
				',Name = '+ dbconnection.escape(data['name']);
				dbconnection.query(sql,function(err,retval){
			  		callback(err,res);
			  	});
		}
		else
			callback(err,res);
		});
};

exports.createApplication = function (data, callback) {
	// Inserting our data and making sure it goes under correct app by FK
	var sql = 'INSERT INTO Applications SET Name =' + dbconnection.escape(data['name']) +
			  ',ApiKey = '+ dbconnection.escape(data['apikey']) +
			  ',ApiSecret = '+ dbconnection.escape(data['apisecret']) +
			  ',ApiSalt = '+ dbconnection.escape(data['apisalt']);
	dbconnection.query(sql, function (err, res){
		var appId = res.insertId;
		var sql = 'INSERT INTO Users_Has_Applications SET Applications_Id =' + appId +
			  ',Users_id = '+ data['user'];
		dbconnection.query(sql, function(err, dat) {
			param = {
				user : data['user'],
				app : appId
			};
			db.getSingleUserApplication(param,callback);
		});
	});
};

exports.getUser = function (email, callback) {
	dbconnection.query('SELECT * FROM Users WHERE email = '+dbconnection.escape(email), callback);
}

exports.getUserById = function (id, callback) {
	dbconnection.query('SELECT id, email, password FROM Users WHERE id = '+dbconnection.escape(id), callback);
}

exports.getUserByFB = function (id, callback) {
	dbconnection.query('SELECT id, email, password FROM Users INNER JOIN FB_Users on FB_Users.Users_id = Users.id WHERE FB_USERS.Users_id = '+dbconnection.escape(id), callback);
}

exports.getUserApplications = function (id, callback) {
	dbconnection.query('SELECT * FROM Applications INNER JOIN Users_has_Applications ON Applications.id = Users_has_Applications.Applications_Id WHERE Users_has_Applications.Users_id = '+dbconnection.escape(id), callback);
}

exports.getSingleUserApplication = function (data, callback) {
	// First let's get the application details.
	// Using INNER JOIN to make sure only the apps that belong to user get shown...
	// ... because someone might have found out an app id that doesn't belong to them.
	dbconnection.query('SELECT Name, ApiKey, ApiSecret FROM Applications INNER JOIN Users_has_Applications ON Applications.id = Users_has_Applications.Applications_id WHERE Users_id = '+
	dbconnection.escape(data.user)+' AND Applications.id ='+
	dbconnection.escape(data.app),function(err, appdetails) {
		// In this callback, we fetch the event data of the application. Again making sure
		// that we are legitimate owners of the app.
		if (err)
			return callback(err, null);
		dbconnection.query('SELECT Events.Id, Events.DeviceIdentifier, Events.Description, Events.Logged FROM Events INNER JOIN Users_has_Applications ON Events.Applications_Id = Users_has_Applications.Applications_id WHERE Users_id = '+
		dbconnection.escape(data.user)+' AND Events.Applications_Id ='+
		dbconnection.escape(data.app),function(err,events){
		// Let's put our data to a pretty object and pass it back.
			var data = {
				app : appdetails[0],
				events : events
			}
			callback(err,data);
		});
	});
}