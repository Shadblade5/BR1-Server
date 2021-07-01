const {TeamSpeak, QueryProtocol} = require("ts3-nodejs-library");
const config = require('./config.json')
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

teamspeak.on("ready", () => {
  console.log("Teamspeak connected")
})
teamspeak.on("error", () => {
  console.log("Teamspeak failed to connect")
})
const shadid = 'Grd6QMFVyHf7pPFGsqazWFt8PK8='

function startTSconnection()
{

}

const clientListFromSGID = async (sgid) => 
{
  return teamspeak.serverGroupClientList(sgid);
}

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
  var servergroups 
  servergroups = await client.servergroups
  return servergroups
 }catch(e)
 {
   console.log(`\n${e}`)
   throw(e)
 }
}

async function getclients()
{
  var clients
  return clients = await teamspeak.clientDbList()
}


module.exports = {
  teamspeak,
  startTSconnection,
  addClientToServerGroups,
  getClientServerGroups,
  getclients,
  removeClientFromServerGroups
};
