const sql = require('../sqlfunctions')
const bot = require('../discordbot')
module.exports = {
  commands: ['award'],
  expectedArgs: '<@user/ID> <award>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 2,
  maxArgs: 2,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var awards;

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
    
    try
    {
      awards = sql.getAwardsDB();
    }
    catch(e)
    {
      console.log(e)
    }

    arguments.shift()
    const award = arguments[0].toUpperCase()
    const numAward = awards.abbr.indexOf(award)
    const awardname = awards.name[numAward]
    if(numAward<0){
      message.reply(`Invalid award. Here is a list of valid awards: \n${awards.abbr}`)
      return;
    }else{
      var currentAwards = []
      var currentAwardNum
      try{
          currentAwardsSql = await sql.getAwards(discordid)
          currentAwardsSql.forEach((element,i) => {
          currentAwards[i] = element.Award.toString();
        });
          currentAwardNum = currentAwards.indexOf(award)

      }catch(e){
        message.reply(e)
        console.log(e)
      }
      if(0<currentAwardNum){
        message.reply(`${displayName} already has the ${awardname} award.`)
        return;
      }else{
        try{
          await sql.addAward(discordid,award)
          message.reply(`${displayName} has been awarded the ${awardname} award.`)
        }catch(e){
          console.log(e)
          message.reply(e)
        }

      }
    }

  },
  permissions: '',
  description:'Gives the user an award',
  requiredRoles: ['Officer','Admin-NCO'],
}
