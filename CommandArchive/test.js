const sql = require('../sqlfunctions')
const awards = require('../info/awards.json')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const ts3 = require('../teamspeak')
const bot = require('../discordbot')
const { TeamSpeakQuery } = require('ts3-nodejs-library/lib/transport/TeamSpeakQuery')
module.exports = {
  commands: ['test'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 1,
  callback: async(message, arguments, text) => {

    var discordid;
    var gmember;
    var displayName
    var dbid
    gmember = message.guild.member(message.mentions.users.first() || bot.client.users.cache.find(user => user.id === arguments[0]))
    if(!gmember)
    {
      message.reply("Please provide a valid @mention or discordID of the target member.")
      return;
    }
    discordid = gmember.id;
    displayName = gmember.displayName || gmember.user.username;
    
   var dbid = await sql.getDBID(discordid);
   var servergroups = await ts3.getServerGroupsFromDBID(dbid);
   var RSQLIDs = {}

   for(var i = 0; i <servergroups.length;i++)
   {
    try{
     RSQLIDs[i] = parseInt(await sql.getRSQLID(servergroups[i].sgid));
    }
    catch(e)
    {
      console.log(e)
    }
   }

   

  // console.log(servergroups)
  // try{
  //   Promise.all(
  //     servergroups.map(async (servergroup)=>
  //     {
  //       await sql.getRSQLID(servergroup.sgid);
  //     })
  //   ).then((values)=>console.log(values));
   
  // }catch(e)
  // {
  //   console.log(e)
  // }

  },
  permissions: '',
  description:'Is simply a test',
  requiredRoles: ['Officer'],
}
