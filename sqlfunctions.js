require('dotenv').config();
const SQLPASS = process.env.SQLPASS
const { makeDb } = require('mysql-async-simple');
const mysql = require('mysql');
const config = require('./config.json')

let connection = mysql.createConnection({
    host: config.IP,
    user: 'Server',
    password: config.SQLPASS,
    database: 'br1'
});

const DiscordID = "208119044308467712";
//const rank = '2LT';

const db = makeDb();

async function connectToSQLServer(){
  try{
    console.log('Starting connection to MySQL server...')
    await db.connect(connection);
    await console.log('MySQL server Connected!');
  }catch (e){
    console.log(e);
    console.log('SQL server connection failed.');
  }
}
//async function getroleID()
//(DiscordName, DiscordID, TeamspeakID, rank)
async function addUser(discordName,DiscordID,TeamspeakID='',rank){
  const sql = 'INSERT INTO master VALUES ('+connection.escape(discordName)+', '+connection.escape(DiscordID)+', '+connection.escape(TeamspeakID)+', '+connection.escape(rank)+')';
    try{
      var result = await query(sql);
      console.log(discordName+' was successfully added to the database');
    }catch(e){
    throw('User already exists in the database.');
    console.log(e)
    }
  }

async function removeUser(discordName,DiscordID){
    const sql = 'DELETE FROM master WHERE DiscordID = '+connection.escape(DiscordID)+'';
      try{
        var result = await query(sql);
        console.log(discordName+' was successfully removed from the database');
      }catch(e){
      throw('Failed to remove user from the database');
      console.log(e)
      }
    }

async function getRank(DiscordID){
  const qrank = 'SELECT Rank FROM master WHERE DiscordID = '+connection.escape(DiscordID);
  try{
  var result = await query(qrank);
  }catch(e){
  throw('Failed to query rank')
  result = 'None'
  }
  return result[0].Rank;
}

async function getCerts(DiscordID){
  const qcert = 'SELECT Certification FROM certifications WHERE DiscordID = '+ connection.escape(DiscordID);
  try{
  var result = await query(qcert);
  }catch(e){
  console.log('Failed to query certs')
  result = 'None'
  }
  return result;
}

async function getMedals(DiscordID){
  const qmedal = 'SELECT Medal FROM medals WHERE DiscordID = '+ connection.escape(DiscordID);
  try{
  var result = await query(qmedal);
  }catch(e){
  console.log('Failed to query medals')
  result = 'None'
  }
  return result;
}

async function updateRank(DiscordID,rank){
  const urank = 'UPDATE master SET Rank = '+connection.escape(rank)+' WHERE DiscordID = '+ connection.escape(DiscordID);
  var result = await query(urank);
  return result;
}

async function addCert(DiscordID,cert){
  const icert = 'INSERT INTO certifications (DiscordID, Certification) VALUES ('+connection.escape(DiscordID)+', '+ connection.escape(cert)+')';
  console.log(icert);
  await query(icert);
}

async function removeCert(DiscordID,cert){
  const icert = 'DELETE FROM certifications WHERE DiscordID = '+ connection.escape(DiscordID)+'AND Certification = '+ connection.escape(cert);
  console.log(icert);
  await query(icert);
}

async function addMedal(DiscordID,medal){
const imedal = 'INSERT INTO medals (DiscordID, Medal) VALUES ('+connection.escape(DiscordID)+', '+ connection.escape(medal)+')';
console.log(imedal);
await query(imedal);
}

async function removeMedal(DiscordID,medal){
  const imedal = 'DELETE FROM medals WHERE DiscordID = '+ connection.escape(DiscordID)+'AND Medal = '+ connection.escape(medal);
  console.log(imedal);
  await query(imedal);
}

async function query(sql){

  try{
  var result = await db.query(connection,sql);
}catch(e){
  throw(e);
  }
    return result;
  }


module.exports = {
  connectToSQLServer,
  getRank,
  getCerts,
  getMedals,
  updateRank,
  addCert,
  removeCert,
  addMedal,
  removeMedal,
  addUser,
  removeUser

};
