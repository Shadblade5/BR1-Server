const mysql = require('mysql');
const {TeamSpeak} = require("ts3-nodejs-library");
import { TeamSpeak, QueryProtocol } from "./src/TeamSpeak"
const SQLPASS = process.env.SQLPASS
const TS3PASS = process.env.TS3PASS

const hostIP = "47.41.254.91";
const qPort = 10011;
const sPort = 9987;

const teamspeak = new TeamSpeak({
  host: hostIP,
  queryport: qPort,
  serverport: sPort,
  username: "BR1Teamspeak",
  password: TS3PASS,
  nickname: "Server Monitor"
});

let connection = mysql.createConnection({
    host: 'br1.ddns.us',
    user: 'Server',
    password: SQLPASS,
    database: 'br1'
});

/*
TeamSpeak.connect({
  host: hostIP,
  queryport: qPort,
  serverport: sPort,
  protocol: QueryProtocol.RAW,
  username: "BR1Teamspeak",
  password: "xJUE7Mue",
  nickname: "ServerMonitor"
}).then(async teamspeak => {

  teamspeak.on("close", async () => {
    console.log("disconnected, trying to reconnect...")
    await teamspeak.reconnect(-1, 1000)
    console.log("reconnected!")
  })

})
*/

teamspeak.on("ready", async () => {
  console.log(`Ready on ${hostIP}:${sPort}`);
  const perms = await teamspeak.clientDbList();
  perms.forEach(client => {
    console.log(`${client.clientNickname}: ${client.clientUniqueIdentifier}`)
  })
});

teamspeak.on("error", e => {
  console.log(e)
});

// teamspeak.whoami().then(whoami => {
//   console.log(whoami);
// })

// teamspeak.on("textmessage", async txt => {
//   if(!txt.invoker.isQuery()){
//     //teamspeak.sendTextMessage(txt.channelGroupId, 2, "Got That!");
//     console.log(`${txt.invoker.nickname}: "${txt.msg}"`);
//   }
// })


var config = {
    user: 'root',
    password: 'mypassword',
    server: 'localhost',
    database: 'SchoolDB'
};


let stream = fs.createReadStream("bezkoder.csv");
let csvData = [];
let csvStream = fastcsv
  .parse()
  .on("data", function(data) {
    csvData.push(data);
  })
  .on("end", function() {
    // remove the first line: header
    csvData.shift();

    // connect to the MySQL database
    // save csvData
  });

stream.pipe(csvStream);
