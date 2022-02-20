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

//const DiscordID = "208119044308467712";
//const rank = '2LT';

const db = makeDb();

async function connectToSQLServer(){
  var connected = false;
  try{

    console.log('Starting connection to MySQL server...')
    await db.connect(connection);
    await console.log('MySQL server Connected!');
    connected = true
  }catch (e){
    console.log('SQL server connection failed.');
    console.log(e)
    connected = false
  }finally{
    return connected
  }
}

async function getdbid(DiscordID){
    const qts3 = 'SELECT DBID FROM master WHERE DiscordID = '+connection.escape(DiscordID);
    try{
      var result = await query(qts3);
    }catch(e)
    {
      console.log(e)
      result = 'None'
      throw('Failed to query DBID')
    }
    if(result[0] == undefined)
    {
      return undefined
    }
    else
    {
    return result[0].DBID;
    }
  }

async function addUser(discordName,DiscordID,rank,DBID=-1){
  const sql = 'INSERT INTO master VALUES ('+connection.escape(discordName)+', '+connection.escape(DiscordID)+', '+connection.escape(rank)+', '+connection.escape(DBID)+')';
    try
    {
      var result = await query(sql);
      console.log(discordName+' was successfully added to the database');
    }catch(e)
    {
      result = 'None'
      console.log(e)
      throw('User already exists in the database.');
    }

}

async function removeUser(discordName,DiscordID){
  const sql = 'DELETE FROM master WHERE DiscordID = '+connection.escape(DiscordID)+'';
  try{
    var result = await query(sql);
    console.log(discordName+' was successfully removed from the database');
  }catch(e){
    console.log(e)
    result = 'None'
    throw('User does not exist in the database.');
  }
}

async function getRank(DiscordID){
  const qrank = 'SELECT Rank FROM master WHERE DiscordID = '+connection.escape(DiscordID);
  try{
  var result = await query(qrank);
  }catch(e){
    console.log(e)
    result = 'None'
    throw('Failed to query Rank')
  }
  if(result[0] == undefined)
  {
    return undefined
  }
  else
  {
  return result[0].Rank;
  }
}

async function getCerts(DiscordID){
  const qcert = 'SELECT Cert FROM certifications WHERE DiscordID = '+ connection.escape(DiscordID);
  try{
  var result = await query(qcert);
  }catch(e){
    console.log(e)
    result = 'None'
    throw('Failed to query certs')
  }
  return result;
}

async function getAwards(DiscordID){
  const qaward = 'SELECT Award FROM awards WHERE DiscordID = '+ connection.escape(DiscordID);
  try{
  var result = await query(qaward);
  }catch(e){
    console.log(e)
    result = 'None'
    throw('Failed to query awards')
  }
  return result;
}

async function updateTS3ID(DiscordID,TS3UID){
  try{
  const uidts3 = 'UPDATE master SET TeamspeakID = '+connection.escape(TS3UID)+' WHERE DiscordID = '+ connection.escape(DiscordID);
  var result = await query(uidts3);
  }catch(e){
    console.log(e)
    result = 'None'
    throw("Failed to update TeamspeakID")
  }
  return result;
}

async function updateDBID(DiscordID,DBID){
  try{
  const qDBID = 'UPDATE master SET DBID = '+connection.escape(DBID)+' WHERE DiscordID = '+ connection.escape(DiscordID);
  var result = await query(qDBID);
  }catch(e){
    console.log(e)
    result = 'None'
    throw("Failed to update DBID")
  }
  return result;
}

async function updateRank(DiscordID,rank){
  try{
  const urank = 'UPDATE master SET Rank = '+connection.escape(rank)+' WHERE DiscordID = '+ connection.escape(DiscordID);
  var result = await query(urank);
  }catch(e){
    console.log(e)
    result = 'None'
    throw("Failed to update rank")
  }
  return result;
}

async function addCert(DiscordID,cert){
  try{
  const icert = 'INSERT INTO certifications (DiscordID, Cert) VALUES ('+connection.escape(DiscordID)+', '+ connection.escape(cert)+')';
  var result = await query(icert);
  }catch(e){
    //console.log(e)
    result = 'None'
    throw("Failed to add cert")
  }
  return result;
}

async function removeCert(DiscordID,cert){
  try{
  const rcert = 'DELETE FROM certifications WHERE DiscordID = '+ connection.escape(DiscordID)+'AND Certification = '+ connection.escape(cert);
  var result = await query(rcert);
  }catch(e){
    console.log(e)
    result = 'None'
    throw("Failed to remove cert")
  }
  return result;
}


async function addAward(DiscordID,award){
  try{
  const iaward = 'INSERT INTO awards (DiscordID, Award) VALUES ('+connection.escape(DiscordID)+', '+ connection.escape(award)+')';
  var result = await query(iaward);
  }catch(e){
    console.log(e)
    result = 'None'
    throw("Failed to add award")
  }
  return result;
}

async function removeAward(DiscordID,award){
  try{
  const raward = 'DELETE FROM awards WHERE DiscordID = '+ connection.escape(DiscordID)+'AND Award = '+ connection.escape(award);
  var result = await query(raward);
  }catch(e){
    console.log(e)
    result = 'None'
    throw("Failed to remove award")
  }
  return result;
}

async function getDiscordIDs(){
  try{
  const rDiscordID = 'SELECT DiscordID FROM master';
  var result = await query(rDiscordID);
  }catch(e){
    result = 'None'
    throw("Failed to get IDs")
  }
  return result;
}


async function fillrole(DISCORDRID=0,TSGRPID=NULL,GRPTYPE=" ",NAME=" ",ABBR=" "){
  try{
    const fillrole = 'INSERT INTO roles (RSQLID, DiscordRID, TSGRPID, GRPTYPE, Name, ABBR) VALUES (DEFAULT, '+ connection.escape(DISCORDRID)+', '+ connection.escape(TSGRPID)+', '+ connection.escape(GRPTYPE)+', '+ connection.escape(NAME)+', '+ connection.escape(ABBR)+')';
    var result = await query(fillrole);
    }catch(e){
      console.log(e)
      result = 'None'
      throw("Failed to push roles")
    }
}

async function querydb(TYPE){
  try{
    TYPE.toUpperCase()
    var q = "SELECT * FROM `roles`"
    // WHERE GRPTYPE = 'RANK'"
  var result = await query(q);
}catch(e){
  console.log(e)
  result = 'None'
  throw("Failed to query DB")
}
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
  getAwards,
  updateRank,
  addCert,
  removeCert,
  addAward,
  removeAward,
  addUser,
  removeUser,
  getDiscordIDs,
  updateTS3ID,
  fillrole,
  updateDBID,
  querydb,
  getdbid
};
