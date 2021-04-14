const sql = require('../sqlfunctions')
module.exports = {
  commands: ['adduser'],
  expectedArgs: '<@user> <TeamspeakID>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 2,
  callback: async(message, arguments, text) => {
    const targetUser = message.mentions.users.first()
    const username = arguments[0]
    const discordName = targetUser.tag
    const discordID = targetUser.id
    const rank = 'PVT'
    arguments.shift()
    const teamspeakID = arguments[0];
    try{
    await sql.addUser(discordName,discordID,teamspeakID,rank)
    message.reply(`${discordName} was successfully added to the database`)
    }catch(e){
    message.reply(e)
    }
  },
  permissions: '',
  description:'Adds a new user to the BR1 Database. TS3 ID is optional.',
  requiredRoles: [],
}
