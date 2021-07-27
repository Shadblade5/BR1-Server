const { DataResolver } = require("discord.js");
const {TeamSpeak, QueryProtocol, ResponseError} = require("ts3-nodejs-library");
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
  username: "BR1Bot",
  password: TS3PASS,
  nickname: "BR1Bot"
});

teamspeak.on("ready", () => {
  console.log("Teamspeak connected")
})
teamspeak.on("error", () => {
  console.log("Teamspeak failed to connect")
})
//const shadid = 'Grd6QMFVyHf7pPFGsqazWFt8PK8='



const clientListFromSGID = async (sgid) => 
{
  return teamspeak.serverGroupClientList(sgid);
}

async function addClientServerGroup(dbid,sgid)
{
 try{
  teamspeak.clientAddServerGroup(dbid,sgid)
 }catch(e)
 {
   console.error(e)
   throw(e)
  }
}

async function removeClientServerGroup(dbid,sgid)
{
  try{

     await teamspeak.clientDelServerGroup(dbid,sgid)

   }catch(e)
   {
     console.error(e)
     throw(e)
    }
}

async function getservergroupclients(sgid)
{
  var cldbids = await teamspeak.serverGroupClientList(sgid) //returns array of client DB ids from a server group
  return cldbids
}
async function getclientdbid(ts3uid)
{
  var dbid = await teamspeak.clientGetDbidFromUid(ts3uid)
  console.log(dbid.cldbid)
  return dbid.cldbid
}


module.exports = {
  teamspeak,
  addClientServerGroup,
  removeClientServerGroup,
  getservergroupclients,
  getclientdbid
};
