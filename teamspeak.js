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


var shadts = 'Grd6QMFVyHf7pPFGsqazWFt8PK8='


const clientListFromSGID = async (sgid) => {
  return teamspeak.serverGroupClientList(sgid);
}

teamspeak.on("ready", async () => {
  console.log(`Ready on ${hostIP}:${sPort}`);
/*  var servergroup = await teamspeak.getServerGroupByName("Leadership Cert");
  //console.log(servergroup);
  // const serverGroup = await teamspeak.serverGroupList();
   var clientList = await teamspeak.serverGroupClientList(servergroup);

  // console.log(clientList);*/
});

teamspeak.on("error", e => {
  console.log(e)
});

async function addClientToServerGroup(ts3uid,sgid)
{
 try{
  var client = await teamspeak.getClientByUid(ts3uid)
  await client.addGroups(sgid)
 }catch(e)
 {
   console.log(`\n${e}`)
 }
}

module.exports = {
addClientToServerGroup
};