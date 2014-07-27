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
	dbconnection.query(sql, callback);
};

exports.getUser = function (email, callback) {
	dbconnection.query('SELECT * FROM Users WHERE email = '+dbconnection.escape(email), callback);
}

exports.getUserById = function (id, callback) {
	dbconnection.query('SELECT * FROM Users WHERE id = '+dbconnection.escape(id), callback);
}

exports.getUserApplications = function (id, callback) {
	dbconnection.query('SELECT * FROM Applications INNER JOIN Users_has_Applications ON Applications.id = Users_has_Applications.Applications_Id WHERE Users_has_Applications.Users_id = '+dbconnection.escape(id), callback);
}

exports.getSingleUserApplication = function (data, callback) {
	dbconnection.query('SELECT Applications.Name, Events.Id, Events.DeviceIdentifier, Events.Description, Events.Logged FROM Events, Applications INNER JOIN Users_has_Applications ON Applications.id = Users_has_Applications.Applications_id WHERE Users_id = '+dbconnection.escape(data.user)+' AND Applications.id ='+ dbconnection.escape(data.app),callback);

}


exports.createApplication = function (data, callback) {
	var sql = 'INSERT INTO Applications SET Name =' + dbconnection.escape(data['name']) +
			  ',ApiKey = '+ dbconnection.escape(data['apikey']) +
			  ',ApiSecret = '+ dbconnection.escape(data['apisecret']) +
			  ',ApiSalt = '+ dbconnection.escape(data['apisalt']);
	dbconnection.query(sql, function(err,res){
		var next = 'INSERT INTO Users_has_Applications SET Applications_Id = '+res.insertId+
		',Users_id = '+ dbconnection.escape(data['userid']);
			dbconnection.query(sql, callback);
	});
}
