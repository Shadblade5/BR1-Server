require('dotenv').config();
const SQLPASS = process.env.SQLPASS
const { makeDb } = require('mysql-async-simple');
const mysql = require('mysql');


let connection = mysql.createConnection({
    host: 'br1.ddns.us',
    user: 'Server',
    password: `${SQLPASS}`,
    database: 'br1'
});

const DiscordID = "208119044308467712";
//const rank = '2LT';

const db = makeDb();

async function connectToServer(){
  try{
    await db.connect(connection);
  }catch (e){
    console.log(e)
  }
  console.log('Connected to the MySQL server.');

}


connectToServer();


async function getRank(DiscordID){
  const qrank = 'SELECT Rank FROM master WHERE DiscordID = '+ connection.escape(DiscordID);
  try{
  var result = await query(qrank);
  }catch(e){
  console.log('Failed to query rank')
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
    console.log(e);
  }
    return result;
  }


module.exports = {
  getRank,
  getCerts,
  getMedals,
  updateRank,
  addCert,
  removeCert,
  addMedal,
  removeMedal

};
