require('dotenv').config();
const SQLPASS = process.env.SQLPASS
const mysql = require('mysql');
console.log(SQLPASS)
let connection = mysql.createConnection({
    host: 'br1.ddns.us',
    user: 'Server',
    password: '${SQLPASS}',
    database: 'br1'
});

connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }

  console.log('Connected to the MySQL server.');
});
