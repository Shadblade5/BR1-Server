const sql = require('../sqlfunctions')

const bot = require('../discordbot')
module.exports = {
  commands: ['getuserinfo'],
  expectedArgs: '<@user/ID>',
  permissionError: '',
  minArgs: 1,
  maxArgs: 1,
  callback: async(message, arguments, text) => {

    var awards
    var currentRank
    var currentAwards

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

    try{
      awards = await sql.getawardsdb();
    }
    catch(e){console.error(e)}
    sql.getRoles()
    message.reply(`Here is ${displayName} info:\nCurrent Rank:\n${currentRank}\nCurrent certs:\n${currentCerts}\nCurrent awards:\n${currentAwards}\n`)


  },
  permissions: '',
  description:'Gets the current certs of the User.',
  requiredRoles: ['Unit Member'],
}
