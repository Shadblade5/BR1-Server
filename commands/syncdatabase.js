const sql = require('../sqlfunctions')
const teamspeak = require('../teamspeak')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const getcerts = require('../CommandArchive/getcerts')
module.exports = {
  commands: ['syncDB'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 0,
  callback: async(message, arguments, text) => {

    const { guild } = message
    


    //first update all ranks and cert from discord

    var shad = '208119044308467712';
    var members
    
    const unitmemberroleid = '728023335744831549'
    var numadded = 0
    var numranked = 0
    var numcerted = 0
    
    var sqlids
    try{
      sqlids = await sql.getDiscordIDs()
    }catch(e)
    {
      console.log(e)
    }

    
    try
    {

      members = await guild.members.fetch()

      members.forEach( async(member)=>  {

        if (member.roles.cache.has(unitmemberroleid)) {
          var memberID
          var targetUser
          var discordName
          var inDB = false;
          var rank = 'PVT'
          var sqlmembercerts = [null]
          var hascert = false;
          var cert = ' '

          targetUser = member.user
          memberID = member.user.id
          discordName = targetUser.tag 
          
          try
          {
            sqlids.forEach(id => 
              {
              if(memberID==id.DiscordID){
                inDB=true;
              }
            })
            if(!inDB)
            {
              await sql.addUser(discordName,memberID,teamspeakID=' ',rank).catch(console.log)
              numadded++
            }
          }catch(e)
          {
            console.log(e) 
          }


          //console.log('Done with adding users')
         
          member.roles.cache.each( async(role) =>
          {
             //update ranks
            for(var j = 0;j<ranks.discordid.length;j++)
            {
              if(role.id == ranks.discordid[j])
              {
                rank = ranks.abbr[j]
                try{
                  await sql.updateRank(memberID,rank)
                  numranked++
                }catch(e)
                {
                console.log(e)
                }
              }
            }

            try
            {
              sqlmembercerts = await sql.getCerts(memberID)
            }catch(e)
            {
              console.log(e)
            }

            //update certs
            for(var j = 0;j<certs.discordid.length;j++)
            {
              if(role.id == certs.discordid[j])
              {

                cert = certs.abbr[j]

                //TODO: Check if array is empty/undefined
                try{
                 if(sqlmembercerts.Cert.includes(cert)){
                   hascert=true;
                 }
                }catch(e)
                {
                  console.log('User has no certs')
                }
                try
                {
                  if(!hascert)
                  {
                    await sql.addCert(memberID,cert)
                    numcerted++
                  }
                }catch(e)
                {
                  throw(e)
                }
              }
            }
          })      

        }
      
      })
      message.reply(`Command finished. \n${numadded} members were added to the database \n${numranked} member's ranks were updated\n${numcerted} member's certs were updated`)
    }catch(e){
      console.log(e)
    }
    
    //blowout ts3's ranks and certs
    //pull awards from Ts3
    //push ranks and certs to ts3
  },
  permissions: '',
  description:'Updates the SQL DB with ranks, certs and awards',
  requiredRoles: ['Officer'],
}
