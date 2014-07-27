"use strict";

module.exports = {
	
	// Default port to listen
	listen : 8888,
	listenSSL : 8443,
		
	// Database driver
	db_driver : "mysql",
	
	// MySQL specific
	mysql : {
		host : "localhost",
		user : "root",
		password : "",
		database : "vsaa"
	},
		
	// MSSQL specific
	mssql : {
    	user: "username",
    	password: "password",
    	server: "server", // You can use 'localhost\\instance' to connect to named instance
    	database: "VSAA",
    	options: {
        	encrypt: false // Use this if you're on Windows Azure
    	}
	},
	
	// Number of worker threads. Default is the number of CPUs.
	workers : require('os').cpus().length,
}
