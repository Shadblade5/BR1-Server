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

async function getDBID(DiscordID){
  try{
  const qDBID = 'SELECT DBID FROM master WHERE DiscordID = '+connection.escape(DiscordID);
  var result = await query(qDBID);
  if(!result)
    throw('Member is not synced on TS3')
  }catch(e){
    console.log(e)
    result = 'None'
    throw("Failed to get DBID")
  }
  try{
  return result[0].DBID;
  }
  catch(e)
  {
    return undefined;
  }
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



async function getRSQLID(SGID){
  try
  {
    const qRSQLID = 'SELECT RSQLID FROM rolesdb WHERE SGID = '+connection.escape(SGID);
    var result = await query(qRSQLID);
    if(result[0]==undefined)
      throw("RSQLID does not exist in DB")
    return result[0].RSQLID;
  }catch(e){
    console.log(e)
  }
}


async function getawardsdb(){
  try
  {
    const qRSQLID = 'SELECT * FROM `rolesdb` WHERE `GRPTYPE` = \'AWARD\'';
    var result = await query(qRSQLID);
    return result;
  }catch(e){
    console.log(e)
  }
}
async function getcertsdb(){
  try
  {
    const qRSQLID = 'SELECT * FROM `rolesdb` WHERE `GRPTYPE` = \'CERT\'';
    var result = await query(qRSQLID);
    return result;
  }catch(e){
    console.log(e)
  }
}
async function getrolesdb(){
  try
  {
    const qRSQLID = 'SELECT * FROM `rolesdb` WHERE `GRPTYPE` = \'ROLE\'';
    var result = await query(qRSQLID);
    return result;
  }catch(e){
    console.log(e)
  }
}
async function getranksdb(){
  try
  {
    const qRSQLID = 'SELECT * FROM `rolesdb` WHERE `GRPTYPE` = \'RANK\'';
    var result = await query(qRSQLID);
    return result;
  }catch(e){
    console.log(e)
  }
}

async function addRole(DiscordID,RSQLID){
  try{
  const iaward = 'INSERT INTO roles (DiscordID, RSQLID) VALUES ('+connection.escape(DiscordID)+', '+ connection.escape(RSQLID)+')';
  var result = await query(iaward);
  }catch(e){
    console.log(e)
    result = 'None'
    throw("Failed to add award")
  }
  return result;
}

async function removeRole(DiscordID,RSQLID){
  try{
  const raward = 'DELETE FROM roles WHERE DiscordID = '+ connection.escape(DiscordID)+'AND RSQLID = '+ connection.escape(RSQLID);
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


async function updateRole(DISCORDRID,SGID){
  try{
    const fillrole = 'UPDATE `rolesdb` SET `DiscordRID`= '+ connection.escape(DISCORDRID)+' WHERE SGID = '+ connection.escape(SGID);
    var result = await query(fillrole);
    }catch(e){
      console.log(e)
      result = 'None'
      throw("Failed to push roles")
    }
}
async function getRoles(DiscordID){
  const sql = 'SELECT master.DiscordName, master.DiscordID, master.Rank, rolesdb.NAME, rolesdb.ABBR, rolesdb.SGID, rolesdb.DiscordRID, rolesdb.GRPTYPE \n'
  +'FROM master \n' 
  +'JOIN roles \n'
  +'ON master.DiscordID = '+ connection.escape(DiscordID)
  +'\nJOIN rolesdb \n'
  +'ON roles.RSQLID = rolesdb.RSQLID'
  try{
  var result = await query(sql);
  }catch(e){
    console.log(e)
    result = 'None'
    throw(`Role acquisition failed for ${DiscordID}`)
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
  updateRank,

  addRole,
  removeRole,
  getRoles,

  addUser,
  removeUser,

  getDiscordIDs,
  
  updateDBID,
  getDBID,
  getRSQLID,

  getawardsdb,
  getcertsdb,
  getrolesdb,
  getranksdb,

  updateRole
};
