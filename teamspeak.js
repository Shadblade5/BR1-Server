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

async function addClientServerGroups(ts3uid,sgid)
{
 try{
  await teamspeak.getClientByUid(ts3uid).then((client)=>client.addGroups(sgid))
 }catch(e)
 {

   console.error(e)
   throw(e)
  }
}

async function removeClientServerGroups(ts3uid,sgid)
{
 try{
  await teamspeak.getClientByUid(ts3uid).then((client)=>client.delGroups(sgid))
 }catch(e)
 {
   console.error(e)
   throw(e)
 }
}

async function getClientServerGroups(ts3uid)
{
 try{
  var servergroups 
  if(ts3uid!='Not Found'|| ts3uid != ' '){
  await teamspeak.getClientByUid(ts3uid).then((client)=>{
    console.log(client)
    try
    {
      servergroups = client.servergroups
    }catch(e)
    {
      throw(e)
    }
    console.log(servergroups)
    return servergroups
  })
  }else
  {
    throw('Teamspeak ID not set')
  }
 }catch(e)
 {
   console.error(e)
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
  addClientServerGroups,
  getClientServerGroups,
  getclients,
  removeClientServerGroups
};
