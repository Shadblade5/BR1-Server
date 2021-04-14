
const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')
const sql = require('./sqlfunctions')
//require('./teamspeak');

const loadCommands = require('./commands/load-commands')

client.on('ready', async () => {
  console.log('The client is ready!')
  await sql.connectToSQLServer();
  loadCommands(client);
})

client.login(config.token);
