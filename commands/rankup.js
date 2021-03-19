const sql = require('../sqlfunctions')
const ranks = require('../info/ranks.json')
module.exports = {
  commands: ['rankup',],
  expectedArgs: '<@user> <rank>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 2,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var member
    var targetUser
    try{
      targetUser = message.mentions.users.first()
      member = guild.members.cache.get(targetUser.id)
    }catch(e){
      message.reply('Please specify someone with a mention to give them a rank.')
      console.log(e);
      return
    }

    arguments.shift()
    const role = ''
    const currentrank = await sql.getRank(targetUser.id)
    const numRank = ranks.abbr.indexOf(currentrank);
    const newrankabbr = ranks.abbr[numRank+1]
    var newrank = ranks.name[numRank+1]
    var oldrank = ranks.name[numRank]
    if(!arguments[0]){
      role = guild.roles.cache.find((role) => {
        return role.name === newrank
      });
      oldrole = guild.roles.cache.find((role) => {
        return role.name === currentRank
      });
        await sql.updateRank(targetUser.id,newrankabbr)
        member.roles.add(role);
        member.roles.remove(oldrole);
        message.reply(`${targetUser.tag} now has the rank ${newrank}`)
      return;
    }
    else{
      if(!ranks.abbr.indexOf(arguments[0])||!ranks.name.indexOf(arguments[0])){
        message.reply(`${arguments[0]} is not a valid rank`)
      }else{
        if(currentRank === arguments[0]){
          message.reply(`${targetUser.tag} already has the rank of ${arguments[0]}`)
          return;
        }else{
          newrank = ranks.name[ranks.abbr.indexOf(arguments[0])]
        }
      }
      role = guild.roles.cache.find((role) => {
        return role.name === newrank
      });
      oldrole = guild.roles.cache.find((role) => {
        return role.name === oldrank
      });
    }




    })
  },
  permissions: '',
  requiredRoles: [],
}
