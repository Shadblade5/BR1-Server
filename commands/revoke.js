const sql = require('../sqlfunctions')
const medals = require('../info/medals.json')
module.exports = {
  commands: ['revoke'],
  expectedArgs: '<@user> <award>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 2,
  maxArgs: 2,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var member
    var targetUser
    try{
      targetUser = message.mentions.users.first()
      member = guild.members.cache.get(targetUser.id)
    }catch(e){
      message.reply('Please specify someone with a mention to give them an award.')
      console.log(e);
      return;
    }
    arguments.shift()
    const award = arguments[0].toUpperCase()
    const numMedal = medals.abbr.indexOf(award)
    const awardname = medals.name[numMedal]
    if(numMedal<0){
      message.reply(`Invalid award. here is a list of valid medals \n${medals.abbr}`)
      return;
    }else{
      var currentMedals = []
      var currentMedalNum
      try{
          currentMedalsSql = await sql.getMedals(targetUser.id)
          currentMedalsSql.forEach((element,i) => {
          currentMedals[i] = element.Medal.toString();
        });
          currentMedalNum = currentMedals.indexOf(award)

      }catch(e){
        message.reply(e)
        console.log(e)
      }
      if(0>currentMedalNum){
        message.reply(`${targetUser.tag} does not have the ${awardname} award.`)
        return;
      }else{
        try{
          await sql.removeMedal(targetUser.id,award)
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
  requiredRoles: [],
}
