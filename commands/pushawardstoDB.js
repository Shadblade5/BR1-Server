const sql = require('../sqlfunctions')
//const awards = require('../info/awards.json')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const ts3 = require('../teamspeak')
const bot = require('../discordbot')
const { TeamSpeakQuery } = require('ts3-nodejs-library/lib/transport/TeamSpeakQuery')
const { DataResolver } = require('discord.js')
module.exports = {
  commands: ['pushawardstoDB'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 1,
  callback: async(message, arguments, text) => {
    const { guild } = message;
    var awards
    const getservergroups = async (discordid)=> {
      var dbid = await sql.getDBID(discordid);
      if(dbid>0)
        return await ts3.getServerGroupsFromDBID(dbid);
      else
        throw(`${discordid} is not synced in the DB`);
    }

    try
    {
      awards = await sql.getawardsdb();
      members = await guild.members.fetch()
    }
    catch(e)
    {
      console.log(e)
    }
    await members.forEach(async (member)=> {
      const  displayName = member.displayName || member.user.username;
      const discordid = member.id;

      getservergroups(discordid)
      .then(servergroups=>{
        for(var i = 0;i<servergroups.length;i++)
        {
          for(var j = 0;j<awards.length;j++)
          {
            //console.log(`${servergroups[i].sgid} == ${awards[j].SGID}`)
            if(servergroups[i].sgid == awards[j].SGID)
            {
              console.log(`Discordname = ${displayName}, Award: ${servergroups[i].name}`)
            }
          }
        }
      })
      .catch(err=>{});
    });

  },
  permissions: '',
  description:'Is simply a test',
  requiredRoles: ['Officer'],
}
