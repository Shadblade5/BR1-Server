const sql = require('../sqlfunctions')
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

    var awards
    var certs
    var roles
    var ranks
    var discordid;
    var member;
    var displayName

    member = message.guild.member(message.mentions.users.first() || bot.client.users.cache.find(user => user.id === arguments[0]))
    if(!member)
    {
      message.reply("Please provide a valid @mention or discordID of the target member.")
      return;
    }
    discordid = member.id;
    displayName = member.displayName || gmember.user.username;

    try
    {
      sqlids = await sql.getDiscordIDs()
      awards = await sql.getawardsdb();
      certs = await sql.getcertsdb();
      roles = await sql.getrolesdb();
      ranks = await sql.getranksdb();
    }
    catch(e)
    {
      console.log(e)
    }
    // console.log(awards)
    // console.log(certs)
    // console.log(roles)
    // console.log(ranks)
    try{
     var test = await sql.getRoles(discordid);
    }catch(e){console.log(e)}
    await console.log(test)

    // const getservergroups = async (discordid)=> {
    //   var dbid = await sql.getDBID(discordid);
    //   if(dbid>0)
    //     return await ts3.getServerGroupsFromDBID(dbid);
    //   else
    //     throw(`${discordid} is not synced in the DB`);
    // }

    // getservergroups(discordid)
    // .then(servergroups=>{
    //   for(var i = 0;i<servergroups.length;i++)
    //   {
    //     for(var j = 0;j<awards.length;j++)
    //     {
    //       if(servergroups[i].sgid == awards[j].SGID)
    //       {
    //         console.log(`Discordname = ${displayName}, Award: ${servergroups[i].name}`)
    //         sql.addAward(discordid,awards[j].RSQLID)

    //       }
    //     }
    //   }
    // })
    // .catch(err=>{});


  
  },
  permissions: '',
  description:'Is simply a test',
  requiredRoles: ['Officer'],
}
