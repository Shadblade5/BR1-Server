const sql = require('../sqlfunctions')
module.exports = {
  commands: ['removeuser'],
  expectedArgs: '<@user>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 1,
  callback: async(message, arguments, text) => {
    const targetUser = message.mentions.users.first()
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
  requiredRoles: [],
}
