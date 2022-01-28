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
    var sqlids

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

      members.forEach( async(member)=>  
      {
        
        if (member.roles.cache.has(unitmemberroleid)) 
        {
          var memberID
          var discordtag
          var discordname
          var inDB = false;
          var rank = 'PVT'
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
              
              await sql.addUser(discordtag,memberID,teamspeakID=' ',rank)
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
                  
                  await sql.updateRank(memberID,rank)             
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
          //     ts3uid = client.clientUniqueIdentifier               
          //   }
          // })
          // try
          // {
          //   sql.updateTS3ID(memberID,ts3uid)
          // }catch(e)
          // {
          //   console.error(e)
          // }
          //pull awards from Ts3

          // var groupids = ranks.groupid.concat(certs.groupid)
          //   sql.getTS3ID(memberID).then(async(ts3uid)=>
          //   {
          //     if(ts3uid != ' '|| ts3uid != 'Not Found')
          //     {
          //       teamspeak.getClientServerGroups(ts3uid).then((servergroups)=>
          //       {
          //         for (const servergroup of servergroups)
          //         {
          //           var awardnum = awards.groupid.indexOf(servergroup)
          //           if(awardnum>=0)
          //           {
          //             var award = awards.abbr[awardnum]
          //             sql.addAward(memberID,award)
          //           }
          //         }
          //       })
          //     }else
          //     {
          //       console.log("TS3 User ID was not found")
          //     }
          //     //blowout ts3's ranks and certs
          //     for(const groupid of groupids)
          //     {
          //       await teamspeak.removeClientServerGroups(ts3uid,groupid).catch((e)=>console.log(e))
          //     }
          //     //push ranks and certs to ts3
          //     sql.getRank(memberID).then((currentrank)=>
          //     {
          //       var groupid = ranks.groupid[ranks.abbr.indexOf(currentrank)]
          //       teamspeak.addClientServerGroups(ts3uid,groupid).catch((e)=>console.log(e))
          //     })
          //     .then(()=>
          //     {
          //       sql.getCerts(memberID).then((currentcerts)=>
          //       {
          //         for(const cert of currentcerts)
          //         {
          //           groupid = certs.groupid[certs.abbr.indexOf(cert.Cert)]
          //           teamspeak.addClientServerGroups(ts3uid,groupid)
          //         }
          //       })
          //     }) 


            // })
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
