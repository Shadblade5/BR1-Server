const sql = require('../sqlfunctions')
const teamspeak = require('../teamspeak')
module.exports = {
  commands: ['populateTS3'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 0,
  callback: async(message, arguments, text) => {

    const { guild } = message
    message.reply("Command Not Done")

  },
  permissions: '',
  description:'Updates TS3 with all ranks and certs',
  requiredRoles: ['Officer'],
}
