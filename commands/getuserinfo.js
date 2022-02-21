const sql = require('../sqlfunctions')
const certs = require('../info/certs.json')
const awards = require('../info/awards.json')
const ranks = require('../info/ranks.json')
const bot = require('../discordbot')
module.exports = {
  commands: ['getuserinfo'],
  expectedArgs: '<@user/ID>',
  permissionError: '',
  minArgs: 1,
  maxArgs: 1,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var discordid;
    var member;
    var displayName

    member = message.guild.member(message.mentions.users.first() || bot.client.users.cache.find(user => user.id === arguments[0]))
    if(!member)
    {
      message.reply("Please provide a valid @mention or discordID of the target member.")
      return;
    }
    discordid = member.id;
    displayName = member.displayName || member.user.username;

    var currentcerts
    var currentawards
    var currentRank
    try{
      currentRank = await sql.getRank(discordid)
      const numRank = ranks.abbr.indexOf(currentRank)
      currentRank = ranks.name[numRank]
      currentawards = await sql.getAwards(discordid)
      currentcerts = await sql.getCerts(discordid)
      for(var i=0;i<currentcerts.length;i++){
        currentcerts[i] = certs.name[certs.abbr.indexOf(currentcerts[i].Cert.toString())] + ' '
      }
      for(var i=0;i<currentawards.length;i++){
        currentawards[i] = awards.name[awards.abbr.indexOf(currentawards[i].Award.toString())] + ' '
      }
      message.reply(`Here is ${displayName} info:\nCurrent Rank:\n${currentRank}\nCurrent certs:\n${currentcerts}\nCurrent awards:\n${currentawards}\n`)

    }catch(e){
      message.reply(`Failed to get ${displayName}'s info.\n`)
      console.log(e);
    }
       

  },
  permissions: '',
  description:'Gets the current certs of the User.',
  requiredRoles: ['Unit Member'],
}
