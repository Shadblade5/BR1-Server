const bot = require('../discordbot.js')
module.exports = {
  commands: ['reloadcommands'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 0,
  callback: async(message, arguments, text) => {

    const { guild } = message
    try
    {
        bot.reloadCommands()
        message.reply("Commands Reloaded!")
    }catch(e)
    {
        message.reply("Commands could not be reloaded")
        console.log(e)
    }
  },
  permissions: '',
  description:'Updates the SQL DB with ranks, certs and awards',
  requiredRoles: ['Officer'],
}