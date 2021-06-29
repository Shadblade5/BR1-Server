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
  console.log('Discord client is ready!')

  do {
    var connection = false
    connection = await sql.connectToSQLServer()
    if(!connection){
      await sleep(10000);
    }
  } while (!connection)

    loadCommands(client);
    console.log('Ready!')
})

  client.login(config.token);

  String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
  }

function reloadCommands()
{
  client.removeAllListeners('message')
  loadCommands(client);
}

module.exports = {
reloadCommands
}