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
      throw('User does not exist in the database.');
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

async function updateTS3ID(DiscordID,TS3ID){
  try{
  const uts3 = 'UPDATE master SET TeamspeakID = '+connection.escape(TS3ID)+' WHERE DiscordID = '+ connection.escape(DiscordID);
  var result = await query(uts3);
  }catch(e){
    throw("Failed to update TeamspeakID")
    console.log(e)
    result = 'None'
  }
  return result;
}

async function updateRank(DiscordID,rank){
  try{
  const urank = 'UPDATE master SET Rank = '+connection.escape(rank)+' WHERE DiscordID = '+ connection.escape(DiscordID);
  var result = await query(urank);
  }catch(e){
    throw("Failed to update rank")
    console.log(e)
    result = 'None'
  }
  return result;
}

async function addCert(DiscordID,cert){
  try{
  const icert = 'INSERT INTO certifications (DiscordID, Certification) VALUES ('+connection.escape(DiscordID)+', '+ connection.escape(cert)+')';
  await query(icert);
  }catch(e){
    throw("Failed to add cert")
    console.log(e)
    result = 'None'
  }
  return result;
}

async function removeCert(DiscordID,cert){
  try{
  const rcert = 'DELETE FROM certifications WHERE DiscordID = '+ connection.escape(DiscordID)+'AND Certification = '+ connection.escape(cert);
  await query(rcert);
  }catch(e){
    throw("Failed to remove cert")
    console.log(e)
    result = 'None'
  }
  return result;
}

async function addMedal(DiscordID,medal){
  try{
  const imedal = 'INSERT INTO medals (DiscordID, Medal) VALUES ('+connection.escape(DiscordID)+', '+ connection.escape(medal)+')';
  await query(imedal);
  }catch(e){
    throw("Failed to add medal")
    console.log(e)
    result = 'None'
  }
  return result;
}

async function removeMedal(DiscordID,medal){
  try{
  const rmedal = 'DELETE FROM medals WHERE DiscordID = '+ connection.escape(DiscordID)+'AND Medal = '+ connection.escape(medal);
  await query(rmedal);
  }catch(e){
    throw("Failed to remove medal")
    console.log(e)
    result = 'None'
  }
  return result;
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
