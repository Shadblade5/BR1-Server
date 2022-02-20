const sql = require('../sqlfunctions')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const awards = require('../info/awards.json')

module.exports = 
{
  commands: ['syncDB'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 0,
  callback: async(message, arguments, text) => 
  {

    const { guild } = message
    

    message.reply("Starting Sync...\n");
    //first update all ranks and certs from discord

    var members
    const unitmemberroleid = '728023335744831549'
    var sqlids
    var count =0;
    try
    {
      sqlids = await sql.getDiscordIDs()
    }catch(e)
    {
      console.error(e)
    }
    try
    {

      members = await guild.members.fetch()

      await members.forEach(async(member)=>  
      {
        
        if (member.roles.cache.has(unitmemberroleid)) 
        {
          var discordid
          var displayName
          var inDB = false;
          var rank = 'PVT'
          var cert = ' '
          discordid = member.id;
          displayName = member.displayName || member.user.username;


          try
          {
            await sqlids.forEach(async id => 
              {
              if(discordid==id.DiscordID){
                inDB=true;
              }
            })
            if(!inDB)
            {
              count = count+1;
              await sql.addUser(displayName,discordid,teamspeakID=' ',rank)
            }
          }catch(e)
          {
            console.error(e) 
          }
        
          await member.roles.cache.each( async(role) =>
          {
             //update ranks
            for(var j = 0;j<ranks.discordid.length;j++)
            {
              if(role.id == ranks.discordid[j])
              {
                rank = ranks.abbr[j]
                try{
                  
                  await sql.updateRank(discordid,rank)    
                  console.log(`${displayName} Rank: ${rank}`)        
                }catch(e)
                {
                console.error(e)
                }
              }
            }

            //update certs
            for(var j = 0;j<certs.discordid.length;j++)
            {
              if(role.id == certs.discordid[j])
              {
                cert = certs.abbr[j]
                console.log(`Member:${displayName} J:${j} cert: ${cert}`)
                //TODO: Check if array is empty/undefined
                try
                {
                  await sql.addCert(discordid,cert)
                  console.log(`${displayName} was assigned the cert ${cert}\n`)
                }catch(e)
                {
                  //console.error(e)
                }
              }
            }
          })    
        }//end ifmember
      })//End Loop
      await message.reply(`Database sync finished. \n ${count} members added to DB\n`)
    }catch(e)
    {
      await message.reply("Database Sync failed\n")
      console.error(e)
    }

    
  },
  permissions: '',
  description:'Updates the SQL DB with ranks, certs based on the discord.',
  requiredRoles: ['Officer'],
}
