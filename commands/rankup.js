const sql = require('../sqlfunctions')
const ranks = require('../info/ranks.json')
module.exports = {
  commands: ['rankup'],
  expectedArgs: '<@user>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 1,
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
    var role
    var oldrole
    var currentRank = ' '
    try{
    currentRank = await sql.getRank(targetUser.id)
    }catch(e){
      message.reply(`User does not exist in the database`)
      console.log(e)
    }
    const numRank = ranks.abbr.indexOf(currentRank);
    if(numRank == 15){
      message.reply(`${targetUser.tag} is already at the maximum rank of Captain`)
      return
    }
    const newrankabbr = ranks.abbr[numRank+1]
    var newrank = ranks.name[numRank+1]
    var oldrank = ranks.name[numRank]

      role = guild.roles.cache.find((role) => {
        return role.name === newrank
      });
      oldrole = guild.roles.cache.find((role) => {
        return role.name === currentRank
      });
        await sql.updateRank(targetUser.id,newrankabbr)
//        member.roles.add(role);
//        member.roles.remove(oldrole);
        message.reply(`${targetUser.tag} now has the rank ${newrank}`)
      return;

  },
  permissions: '',
  requiredRoles: [],
}
