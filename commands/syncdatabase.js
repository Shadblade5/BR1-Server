const sql = require('../sqlfunctions')
const teamspeak = require('../teamspeak')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const awards = require('../info/awards.json')
const { getStringDiff } = require('../discordbot')

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
    try
    {
      sqlids = await sql.getDiscordIDs()
      clients = await teamspeak.getclients()
    }catch(e)
    {
      console.error(e)
    }
    try
    {

      members = await guild.members.fetch()

      members.forEach( async(member)=>  
      {
        
        if (member.roles.cache.has(unitmemberroleid)) 
        {
          var ts3id
          var memberID
          var discordtag
          var discordname
          var inDB = false;
          var rank = 'PVT'
          var sqlmembercerts
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
            console.error(e) 
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

                //TODO: Check if array is empty/undefined
                try
                {
                  await sql.addCert(memberID,cert)
                  console.log(`${discordtag} was assigned the cert ${cert}\n`)
                }catch(e)
                {
                  console.error(e)
                }
              }
            }
          })    

          //Fill TS3 IDs
          // var diff = 0
          // clients.forEach(client =>
          // {
          //   try
          //   {
          //     diff = getStringDiff(discordname[0].toString(), client.clientNickname.toString())
          //   }catch(e)
          //   {
          //     console.error(e)
          //   }
          //   if(diff==0)
          //   {
          //     ts3id = client.clientUniqueIdentifier               
          //   }
          // })
          // try
          // {
          //   sql.updateTS3ID(memberID,ts3id)
          // }catch(e)
          // {
          //   console.error(e)
          // }
          //pull awards from Ts3

          try
          {
            ts3id = await sql.getTS3ID(memberID)
          }catch(e)
          {
            console.error(e)
          }
          if(ts3id != ' '|| ts3uid != 'Not Found')
          {
            await teamspeak.getClientServerGroups(ts3id).then((servergroups)=>
              {
                for (const servergroup of servergroups)
                {
                  var awardnum = awards.groupid.indexOf(servergroup)
                  if(awardnum>=0)
                  {
                    var award = awards.abbr[awardnum]
                    sql.addAward(memberID,award)
                  }
                }
              })

  


            var groupids = ranks.groupid.concat(certs.groupid)
            //blowout ts3's ranks and certs
    
        //push ranks and certs to ts3
            for(const groupid of groupids)
            {
              await teamspeak.removeClientServerGroups(ts3id,groupid).catch((e)=>console.log(e))
            }
  
            //add rank then add all certs
            sql.getRank(memberID).then((currentrank)=>
            {
              var groupid = ranks.groupid[ranks.abbr.indexOf(currentrank)]
              teamspeak.addClientServerGroups(ts3id,groupid).catch((e)=>console.log(e))
            })
            .then(()=>
            {
              sql.getCerts(memberID).then((currentcerts)=>
              {
                for(const cert of currentcerts)
                {
                  groupid = certs.groupid[certs.abbr.indexOf(cert.Cert)]
                  teamspeak.addClientServerGroups(ts3id,groupid)
                }
              })
            }) 
          }
          else{
            console.log('Not Found')
          }//end ts3id not found
          



        }//end ifmember
      })//End Loop
    }catch(e)
    {
      console.error(e)
    }

    await message.reply(`Command finished.\n`)
  },
  permissions: '',
  description:'Updates the SQL DB with ranks, certs and awards',
  requiredRoles: ['Officer'],
}
