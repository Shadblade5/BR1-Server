const sql = require('../sqlfunctions')
const certs = require('../info/certs.json')
const medals = require('../info/medals.json')
const ranks = require('../info/ranks.json')
module.exports = {
  commands: ['getuserinfo'],
  expectedArgs: '<@user/ID>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 1,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var member
    var targetUser
    var memberID
    var wrongargs=false;
    try{
      targetUser = message.mentions.users.first()
      member = guild.members.cache.get(targetUser.id)
      memberID = targetUser.id
      var wrongargs=false;
    }catch(e){
      //console.log(e);
      var wrongargs=true;
    }
      if(wrongargs){
        try{
          memberID = arguments[0]
          member = guild.members.cache.get(memberID)
          targetUser = member.user
          var wrongargs=false;
        }catch(e){
          //console.log(e);
          var wrongargs=true;
        }
      }
    if(wrongargs){
      message.reply('Please specify someone to run the command on')
      return;
    }

    var currentcerts
    var currentawards
    var currentRank
    try{
      currentRank = await sql.getRank(targetUser.id)
      const numRank = ranks.abbr.indexOf(currentRank)
      currentRank = ranks.name[numRank]
      currentawards = await sql.getMedals(targetUser.id)
      currentcerts = await sql.getCerts(targetUser.id)
      for(var i=0;i<currentcerts.length;i++){
        currentcerts[i] = ' '+currentcerts[i].Cert.capitalize();
      }
      for(var i=0;i<currentawards.length;i++){
        currentawards[i] = ' '+medals.name[medals.abbr.indexOf(currentawards[i].Medal.toString())]
      }
      message.reply(`Here is ${targetUser.tag} info:\nCurrent Rank: ${currentRank}\nCurrent certs:${currentcerts}\nCurrent awards:${currentawards}`)

    }catch(e){
      message.reply(`Failed to get ${targetUser.tag}'s info.\nError: ${e}`)
      console.log(e);
    }

  },
  permissions: '',
  description:'Gets the current certs of the User.',
  requiredRoles: [],
}
