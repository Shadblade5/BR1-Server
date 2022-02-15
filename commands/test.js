const sql = require('../sqlfunctions')
const awards = require('../info/awards.json')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const ts3 = require('../teamspeak')
const functions = require('../discordbot')
const { TeamSpeakQuery } = require('ts3-nodejs-library/lib/transport/TeamSpeakQuery')
module.exports = {
  commands: ['test'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 1,
  callback: async(message, arguments, text) => {
    var discordid = message.author.id;
    console.log(discordid);
    var uid = await sql.getTS3ID(discordid);
    console.log(uid);
    var dbid = await ts3.getclientdbid(uid);
    await sql.updateDBID(discordid,dbid);
    
    //ts3.addClientServerGroup(dbid,9)
    //ts3.removeClientServerGroup(dbid,9)


  },
  permissions: '',
  description:'Is simply a test',
  requiredRoles: ['Officer'],
}
