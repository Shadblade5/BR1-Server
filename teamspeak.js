//import { TeamSpeak, QueryProtocol } from "./ts3-nodejs-library/src/TeamSpeak"
const {TeamSpeak} = require("ts3-nodejs-library");

const mysql = require('mysql');
require('dotenv').config();
const SQLPASS = process.env.SQLPASS
const TS3PASS = process.env.TS3PASS
const hostIP = process.env.hostIP

const qPort = 10011;
const sPort = 9987;

const teamspeak = new TeamSpeak({
  host: hostIP,
  queryport: qPort,
  serverport: sPort,
  username: "BR1Teamspeak",
  password: TS3PASS,
  nickname: "ServerMonitor"
});

const clientListFromSGID = async (sgid) => {
  return teamspeak.serverGroupClientList(sgid);
}

teamspeak.on("ready", async () => {
  console.log(`Ready on ${hostIP}:${sPort}`);
  console.log(await teamspeak.getServerGroupByName("Leadership Cert"));
  // const serverGroup = await teamspeak.serverGroupList();
  // const clientList = await teamspeak.serverGroupClientList(116);
  // console.log(clientList);
});

teamspeak.on("error", e => {
  console.log(e)
});

// teamspeak.on("textmessage", async txt => {
//   if(!txt.invoker.isQuery()){
//     //teamspeak.sendTextMessage(txt.channelGroupId, 2, "Got That!");
//     console.log(`${txt.invoker.nickname}: "${txt.msg}"`);
//   }
// })
