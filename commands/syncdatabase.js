const sql = require('../sqlfunctions')
const teamspeak = require('../teamspeak')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const { getStringDiff } = require('../discordbot')

module.exports = {
  commands: ['syncDB'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 0,
  callback: async(message, arguments, text) => {

    const { guild } = message
    


    //first update all ranks and cert from discord

    var members
    
    const unitmemberroleid = '728023335744831549'
    var numadded = 0
    var numranked = 0
    var numcerted = 0
    
    
    var hit = false
    
    var clients
    var reply = ' '
    
    var sqlids
    try{
      sqlids = await sql.getDiscordIDs()
      clients = await teamspeak.getclients()
    }catch(e)
    {
      console.exception(e)
    }
    try
    {

      members = await guild.members.fetch()

      members.forEach( async(member)=>  
      {
        
        if (member.roles.cache.has(unitmemberroleid)) {
          var ts3id = 'Not Found'
          var memberID
          var discordtag
          var discordname
          var inDB = false;
          var rank = 'PVT'
          var sqlmembercerts = [null]
          var hascert = false;
          var cert = ' '

          memberID = member.user.id
          discordtag = member.user.tag 
          discordname = discordtag.split('#')

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
              numadded=numadded+1
              await sql.addUser(discordtag,memberID,teamspeakID=' ',rank)
              reply += `${discordtag} was succefully added to the database\n`
            }
          }catch(e)
          {
            console.exception(e) 
          }
        
          member.roles.cache.each( async(role) =>
          {
             //update ranks
            for(var j = 0;j<ranks.discordid.length;j++)
            {
              if(role.id == ranks.discordid[j])
              {
                rank = ranks.abbr[j]
                try{
                  numranked=numranked+1
                  await sql.updateRank(memberID,rank)
                  reply += `${discordtag} was ranked up to ${rank}\n`                  
                }catch(e)
                {
                console.exception(e)
                }
              }
            }

            try
            {
              sqlmembercerts = await sql.getCerts(memberID)
            }catch(e)
            {
              console.exception(e)
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
                  }else
                  {
                    numcerted= numcerted+1
                    await sql.addCert(memberID,cert)
                    reply += `${discordtag} was assigned the cert ${cert}}\n`     
                  }
                }catch(e)
                {
                  //console.log(`User does not have the ${cert}`)
                }
              }
            }
          })    

          //Fill TS3 IDs
          var diff = 0
          console.log("Start TS3 ID")
          clients.forEach(client =>
          {
            try
            {
              diff = getStringDiff(discordname[0].toString(), client.clientNickname.toString())
            }catch(e)
            {
              console.exception(e)
            }
            if(diff==0)
            {
              ts3id = client.clientUniqueIdentifier               
            }
          })
          try
          {
            sql.updateTS3ID(memberID,ts3id)
          }catch(e)
          {
            console.exception(e)
          }
        }
      })

      message.reply(`Command finished.\n`)
    }catch(e){
      console.exception(e)
    }
    




    //blowout ts3's ranks and certs
    //pull awards from Ts3
    //push ranks and certs to ts3
  },
  permissions: '',
  description:'Updates the SQL DB with ranks, certs and awards',
  requiredRoles: ['Officer'],
}
