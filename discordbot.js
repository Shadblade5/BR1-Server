require('events').EventEmitter.defaultMaxListeners = 30;
const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('../../config.json')
const sql = require('./sqlfunctions')
const loadCommands = require('./commands/load-commands');
const fs = require('fs');

async()=>{
  while(true){
    fs.readFile('C:/actions-runner/restartflag.json',(err,data) =>{
      var restart = JSON.parse(data);
      console.log("Restart Flag: "+restart.flag)
      if(restart.flag)
      {
        process.exit(1);
      }
    })
  sleep(30000)
  }
}

function getStringDiff(a, b)
{
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  var matrix = [];

  // increment along the first column of each row
  var i;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i-1) == a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

client.on('ready', async () => {
  console.log('Discord client has started')
  await sleep(3000)

    try{
      await sql.connectToSQLServer()
    }catch(e){
      console.log(e)
    }
    // try{
    // t.teamspeak.connect().then(console.log("Teamspeak Connected"))
    // }catch(e)
    // {
    //   console.log(e)
    // }
    loadCommands(client);
    console.log('Ready!')
})

client.login(config.token);

  String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
  }

  module.exports = {
  getStringDiff,
  sleep
  }
