const sql = require('../sqlfunctions')
const awards = require('../info/awards.json')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const ts3 = require('../teamspeak')
const functions = require('../discordbot')
module.exports = {
  commands: ['restart'],
  expectedArgs: '',
  permissionError: '',
  minArgs: 0,
  maxArgs: 1,
  callback: async(message, arguments, text) => {

    process.exit(1);

  },
  permissions: '',
  description:'Restarts the bot',
  requiredRoles: ['Officer'],
}
