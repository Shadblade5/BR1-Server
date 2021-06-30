require('events').EventEmitter.defaultMaxListeners = 30;
const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')
const sql = require('./sqlfunctions')
const teamspeak = require('./teamspeak.js');
const loadCommands = require('./commands/load-commands');
const { EventEmitter } = require('stream');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

client.on('ready', async () => {
  console.log('Discord client has started')
  await sleep(5000)

  try {
    await sql.connectToSQLServer(sql.connection)
  } catch (e) {
    console.log(e)
  }
  loadCommands(client);
  console.log('Ready!')
})

client.login(config.token).then((response) => {
  console.log('Login response: ' + response)
}, reject => {
  console.error(reject)
  console.error('Failed to login to discord')
})

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

function reloadCommands() {
  client.removeAllListeners('message')
  loadCommands(client);
}

module.exports = {
  reloadCommands
}