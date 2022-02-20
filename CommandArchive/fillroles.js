const sql = require('../sqlfunctions')
const awards = require('../info/awards.json')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const ts3 = require('../teamspeak')
const bot = require('../discordbot')
const { TeamSpeakQuery } = require('ts3-nodejs-library/lib/transport/TeamSpeakQuery')
module.exports = {
  commands: ['fillroles'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 1,
  callback: async(message, arguments, text) => {
    const { guild } = message;
    var i;
  message.reply("Updating Role DB");
  try
  {
    for(i = 0;i<ranks.name.length;i++)
    {
      await sql.fillrole(ranks.discordid[i],ranks.groupid[i],'RANK',ranks.name[i],ranks.abbr[i]);
    }
  }catch(e)
  {
    console.log(e)
  }
  for(i = 0;i<certs.name.length;i++)
  {
    await sql.fillrole(certs.discordid[i],certs.groupid[i],'CERT',certs.name[i],certs.abbr[i]);
  }
  for(i = 0;i<awards.name.length;i++)
  {
    await sql.fillrole(0,awards.groupid[i],'AWARD',awards.name[i],awards.abbr[i]);
  }
  await message.reply("Role DB Updated!");




  },
  permissions: '',
  description:'Is simply a test',
  requiredRoles: ['Officer'],
}
