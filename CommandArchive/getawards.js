const sql = require('../sqlfunctions')
const medals = require('../info/medals.json')
const bot = require('../discordbot')
module.exports = {
  commands: ['getawards'],
  expectedArgs: '<@user/ID>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 1,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var member
    var discordid;
    var member;
    var displayName;
    
    member = message.guild.member(message.mentions.users.first() || bot.client.users.cache.find(user => user.id === arguments[0]))
    if(!member)
    {
      message.reply("Please provide a valid @mention or discordID of the target member.")
      return;
    }
    discordid = member.id;
    displayName = member.displayName || member.user.username;



    var currentawards
    try{
      currentawards = await sql.getMedals(discordid)
      for(var i=0;i<currentawards.length;i++){
        currentawards[i] = ' '+medals.name[medals.abbr.indexOf(currentawards[i].Medal.toString())]
      }
          message.reply(`${displayName} has the following awards:\n ${currentawards}`)
    }catch(e){
      message.reply(`Failed to get ${displayName}'s awards.'`)
      console.log(e);
    }

  },
  permissions: '',
  description:'Gets the current awards of the User.',
  requiredRoles: ['Unit Member'],
}
