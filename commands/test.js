const sql = require('../sqlfunctions')
const awards = require('../info/awards.json')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const ts3 = require('../teamspeak')
const bot = require('../discordbot')
const { TeamSpeakQuery } = require('ts3-nodejs-library/lib/transport/TeamSpeakQuery')
module.exports = {
  commands: ['test'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 1,
  callback: async(message, arguments, text) => {





  },
  permissions: '',
  description:'Is simply a test',
  requiredRoles: ['Officer'],
}
