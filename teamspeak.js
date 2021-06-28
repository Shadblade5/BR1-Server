//import { TeamSpeak, QueryProtocol } from "./ts3-nodejs-library/src/TeamSpeak"
const {TeamSpeak, QueryProtocol} = require("ts3-nodejs-library");

const config = require('./config.json')
//const mysql = require('mysql');
require('dotenv').config();
const TS3PASS = config.TS3PASS
const hostIP = config.TS3IP


const qPort = 10011;
const sPort = 9987;

const teamspeak = new TeamSpeak({
  host: hostIP,
  queryport: qPort,
  serverport: sPort,
  protocol: QueryProtocol.RAW,
  username: "BR1Teamspeak",
  password: TS3PASS,
  nickname: "ServerMonitor"
});

const shadid = 'Grd6QMFVyHf7pPFGsqazWFt8PK8='


const clientListFromSGID = async (sgid) => {
  return teamspeak.serverGroupClientList(sgid);
}
async function startTeamspeak(){
  teamspeak.on("ready", async () => {
    console.log(`Ready on ${hostIP}:${sPort}`);
  });
}
teamspeak.on("error", e => {
  console.log(e)
});

async function addClientToServerGroups(ts3uid,sgid)
{
 try{
  var client = await teamspeak.getClientByUid(ts3uid)

    await client.addGroups(sgid)

 }catch(e)
 {

   console.log(`\n${e}`)
   throw(e)
  }
}

async function removeClientFromServerGroups(ts3uid,sgid)
{
 try{
  var client = await teamspeak.getClientByUid(ts3uid)
  await client.delGroups(sgid)
 }catch(e)
 {
   console.log(`\n${e}`)
   throw(e)
 }
}

async function getClientServerGroups(ts3uid)
{
 try{
  var client = await teamspeak.getClientByUid(ts3uid)
  var servergroups = await client.servergroups
  console.log(servergroups)
 }catch(e)
 {
   console.log(`\n${e}`)
   throw(e)
 }
}



module.exports = {
startTeamspeak,
addClientToServerGroups,
removeClientFromServerGroups
};
