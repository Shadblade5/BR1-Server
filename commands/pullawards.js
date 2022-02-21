const sql = require('../sqlfunctions')
const awards = require('../info/awards.json')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const ts3 = require('../teamspeak')
const bot = require('../discordbot')
const { TeamSpeakQuery } = require('ts3-nodejs-library/lib/transport/TeamSpeakQuery')
module.exports = {
  commands: ['pullawards'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 1,
  callback: async(message, arguments, text) => {
    const { guild } = message;

    const getservergroups = (discordid) => {
      return new Promise((resolve, reject) => {
          try{
          var dbid = sql.getDBID(discordid);
          var servergroups = ts3.getServerGroupsFromDBID(dbid);
          }
          catch(e)
          {
              reject(e)  // calling `reject` will cause the promise to fail with or without the error passed as an argument
              return        // and we don't want to go any further
          }
          resolve(servergroups)
        });
    }

    try
    {
      const awards = await sql.getawardsdb();
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
            if(servergroups[i].sgid == awards[j].SGID)
            {
              console.log(`Discordname = ${displayName}, Award: ${servergroups[i].name}`)
            }
          }
        }
      })
      .catch(err=>console.error(err));
    });

  },
  permissions: '',
  description:'Is simply a test',
  requiredRoles: ['Officer'],
}
