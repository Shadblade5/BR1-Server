const {TeamSpeak} = require("ts3-nodejs-library");

const hostIP = "47.41.254.91";
const qPort = 10011;
const sPort = 9987;

const teamspeak = new TeamSpeak({
  host: hostIP,
  queryport: qPort,
  serverport: sPort,
  username: "BR1Teamspeak",
  password: "xJUE7Mue",
  nickname: "Gamer"
});

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
