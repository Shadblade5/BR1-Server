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


    gmember = message.guild.member(message.mentions.users.first() || bot.client.users.cache.find(user => user.id === arguments[0]))
    if(!gmember)
    {
      message.reply("Please provide a valid @mention or discordID of the target member.")
      return;
    }
    discordid = gmember.id;
    displayName = gmember.displayName || gmember.user.username;
    


   getservergroups(discordid)
      .then(servergroups=>{
        console.log(servergroups)
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

  //  var dbid = await sql.getDBID(discordid);
  //  console.log(dbid)
  //  var servergroups = await ts3.getServerGroupsFromDBID(dbid);
  //  var RSQLIDs = {}

  //  for(var i = 0; i <servergroups.length;i++)
  //  {
  //   try{
  //    RSQLIDs[i] = parseInt(await sql.getRSQLID(servergroups[i].sgid));
  //    console.log(RSQLIDs[i])
  //   }
  //   catch(e)
  //   {
  //     console.log(e)
  //   }
  //  }
   

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
