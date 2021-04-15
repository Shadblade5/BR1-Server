const sql = require('../sqlfunctions')
module.exports = {
  commands: ['removeuser'],
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
      console.log(e)
      message.reply('Please specify someone with a mention to remove them from the database.')
      return;
    }
    const username = arguments[0]
    const discordName = targetUser.tag
    const discordID = targetUser.id
    try{
    await sql.removeUser(discordName,discordID)
    message.reply(`${discordName} was successfully removed from the database`)
    }catch(e){
    message.reply(e)
    }
  },
  permissions: '',
  description:'Removes a existing member from the BR1 Database.',
  requiredRoles: [],
}
