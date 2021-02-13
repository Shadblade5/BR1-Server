require('dotenv').config();
const SQLPASS = process.env.SQLPASS
const mysql = require('mysql');

let connection = mysql.createConnection({
    host: 'br1.ddns.us',
    user: 'Server',
    password: `${SQLPASS}`,
    database: 'br1'
});
const DiscordID = "208119044308467712";
connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }


  //var sql = "UPDATE customers SET address = 'Canyon 123' WHERE address = 'Valley 345'";
  console.log('Connected to the MySQL server.');
});

function getRank(DiscordID){
const qrank = 'SELECT Rank FROM master WHERE DiscordID = '+ `${DiscordID}`;
return  query(qrank);
}

function query(sql){

  connection.query(sql ,function (err, result) {
    if (err) throw err;
    console.log(result);
  });
  return result;
}
