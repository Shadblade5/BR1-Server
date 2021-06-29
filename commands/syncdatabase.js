const sql = require('../sqlfunctions')
const teamspeak = require('../teamspeak')
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
    var num = 0;
    
    try
    {

     members = await guild.members.fetch()
     //console.log(members.user.id)
     members.each( async(member)=>  {
      var memberID
      var targetUser
      var discordName
      
      targetUser = member.user
      memberID = member.user.id
      discordName = targetUser.tag  
      rank = 'PVT'
      //console.log(`Name:${discordName}\nID: ${memberID}`)
      try{
        await sql.addUser(discordName,memberID,teamspeakID=' ',rank)
      }catch(e){
        throw(e)
      }
      num++;
      })
    }catch(e)
    {
      console.log('Error')
    }
    message.reply(`Command now done ${num}`)
    //  console.log()
    //console.log(member)
    //blowout ts3's ranks and certs
    //pull awards from Ts3
    //push ranks and certs to ts3
  },
  permissions: '',
  description:'Updates the SQL DB with ranks, certs and awards',
  requiredRoles: ['Officer'],
}
