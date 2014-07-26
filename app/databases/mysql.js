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

