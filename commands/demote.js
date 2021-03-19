const sql = require('../sqlfunctions')
const ranks = require('../info/ranks.json')
module.exports = {
  commands: ['demote'],
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

    if(!arguments[0]){
      const currentrank = await sql.getRank(targetUser.id)
      const numRank = ranks.abbr.indexOf(currentrank);
      const newrank = ranks.abbr[numRank-1]

      await sql.updateRank(targetUser.id,newrank)

      message.reply(`${targetUser.tag} now has the rank ${newrank}`)
      return;
    }



    const role = guild.roles.cache.find((role) => {
      return role.name === roleName
    })
    if(!role) {
      message.reply(`There is no rank with the name ${roleName}`)
      return;
    }

    else{

    }
    if(member.roles.cache.get(role.id)){
      member.roles.add(role)
      message.reply(`${targetUser.tag} now has the rank ${role}`)
    }
    else{
      message.reply(`${targetUser.tag} alread has the rank ${role}`)
    }



  },
  permissions: '',
  requiredRoles: [],
}
