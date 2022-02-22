const sql = require('../sqlfunctions')
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
    var unitmemberroleid
    var members
    var sqlids
    var count =0;

    try
    {
      sqlids = await sql.getDiscordIDs()
      awards = await sql.getawardsdb();
      certs = await sql.getcertsdb();
      roles = await sql.getrolesdb();
      ranks = await sql.getranksdb();
    }catch(e)
    {
      console.error(e)
    }
    
    roles.forEach((role)=> {
      if(role.ABBR=='UM')
      {
        unitmemberroleid =role.DiscordRID
      }
    })
    console.log(unitmemberroleid)
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
            await sqlids.forEach(async user => {
              if(discordid==user.DiscordID)
              {
                inDB=true;
              }
            })
            if(!inDB)
            {
              console.log("not in DB")
              count = count+1;
              await sql.addUser(displayName,discordid,rank)
            }
          }catch(e)
          {
            console.error(e) 
          }
        
          await member.roles.cache.each( async(role) =>
          {
            for(var i = 0; i<ranks.length;i++)
              if(role.id == ranks[i].DiscordRID)
                sql.updateRank(discordid,ranks[i].ABBR)
            for(var i = 0;i<certs.length;i++)
              if(role.id == certs[i].DiscordRID)
                sql.addRole(discordid,certs[i].RSQLID)
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
