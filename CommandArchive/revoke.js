const sql = require('../sqlfunctions')
const awards = require('../info/awards.json')
module.exports = {
  commands: ['revokeaward'],
  expectedArgs: '<@user/ID> <award>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 2,
  maxArgs: 2,
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



    arguments.shift()
    const award = arguments[0].toUpperCase()
    const numAward = awards.abbr.indexOf(award)
    const awardname = awards.name[numAward]
    if(numAward<0){
      message.reply(`Invalid award. here is a list of valid awards \n${awards.abbr}`)
      return;
    }else{
      var currentAwards = []
      var currentAwardNum
      try{
          currentAwardsSql = await sql.getAwards(targetUser.id)
          currentAwardsSql.forEach((element,i) => {
          currentAwards[i] = element.Award.toString();
        });
          currentAwardNum = currentAwards.indexOf(award)

      }catch(e){
        message.reply(e)
        console.log(e)
      }
      if(0>currentAwardNum){
        message.reply(`${targetUser.tag} does not have the ${awardname} award.`)
        return;
      }else{
        try{
          await sql.removeAward(targetUser.id,award)
          message.reply(`${targetUser.tag} has been revoked the ${awardname} award.`)
        }catch(e){
          console.log(e)
          message.reply(e)
        }

      }
    }

  },
  permissions: '',
  description:'Revokes the user an award',
  requiredRoles: ['Officer','Admin-NCO'],
}
