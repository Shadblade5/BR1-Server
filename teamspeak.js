//import { TeamSpeak, QueryProtocol } from "./ts3-nodejs-library/src/TeamSpeak"
const { TeamSpeak, QueryProtocol } = require("ts3-nodejs-library");

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
  teamspeak.serverGroupClientList(sgid).then((response) => {
    return response
  }, reject => {
    console.error(reject)
    return null
  })
}

async function startTeamspeak() {
  teamspeak.on("ready", async () => {
    console.log(`Ready on ${hostIP}:${sPort}`);
  });
}

teamspeak.on("error", e => {
  console.error('Failed to connect to teamspeak')
  console.error(e)
});

async function addClientToServerGroups(ts3uid, sgid) {
  teamspeak.getClientByUid(ts3uid).then((response) => {
    response.addGroups(sgid).catch(reason => {
      console.error(reason)
    })
  }, reject => {
    console.error(reject)
  })
}

async function removeClientFromServerGroups(ts3uid, sgid) {
  teamspeak.getClientByUid(ts3uid).then((response) => {
    response.delGroups(sgid).catch(reason => {
      console.error(reason)
    })
  }, reject => {
    console.error(reject)
  })
}

async function getClientServerGroups(ts3uid) {
  teamspeak.getClientByUid(ts3uid).then((clientresp) => {
    clientresp.servergroups.then((svgroupresp) => {
      console.log(svgroupresp)
    }, reject => {
      console.error(reject)
    })
  }, reject => {
    console.error(reject)
  })
}



module.exports = {
  startTeamspeak,
  addClientToServerGroups,
  removeClientFromServerGroups
};
