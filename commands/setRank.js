const sql = require('../sqlfunctions')
const ranks = require('../info/ranks.json')
module.exports = {
  commands: ['setrank'],
  expectedArgs: '<@user/ID> <rank>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 2,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var discordid
    var member
    var displayName
    member = message.guild.gmember(message.mentions.users.first() || bot.client.users.cache.find(user => user.id === arguments[0]))
    if(!member)
    {
      message.reply("Please provide a valid @mention or discordID of the target gmember.")
      return;
    }
    discordid = member.id;
    displayName = member.displayName || member.user.username;

    //TESTING
    arguments.shift()
    arguments[0] = arguments[0].toUpperCase()
    var newrank = arguments[0]

    var currentAuthorRankabbr;
    var currentRankabbr = ' ';
    var currentRank;
    var newnumRank;
    var authorUser = guild.members.cache.get(message.author.id)
    if(discordid == authorUser.id && discordid != 208119044308467712)
    {
      message.reply(`You cannot rank yourself up.`)
      return;
    }

    try
    {
      currentRankabbr = await sql.getRank(discordid)
      currentAuthorRankabbr = await sql.getRank(authorUser.id)
    }catch(e)
    {
      message.reply(`User does not exist in the database`)
    }
    currentRank = ranks.name[ranks.abbr.indexOf(currentRankabbr)]

    const numRank = ranks.abbr.indexOf(newrank)
    const authNumRank = ranks.abbr.indexOf(currentAuthorRankabbr);

    if(numRank>=authNumRank)
    {
      message.reply(`You cannot rank up someone at or above your rank.`)
      return;
    }

    if(numRank<0)
    {
        message.reply(`The rank ${newrank} does not exist, here is the list of ranks \n ${ranks.abbr}`)
        return;
    }

    const newrankabbr = ranks.abbr[numRank]

    if(newrank===currentRankabbr||newrank===ranks.name[ranks.abbr.indexOf(currentRankabbr)])
    {
      message.reply(`${displayName} is already the rank of ${currentRank}`)
      return;
    }

    if((0>ranks.abbr.indexOf(newrank))||(0>ranks.name.indexOf(newrank)))
    {

      if(ranks.abbr.indexOf(newrank)>-1)
      {
        newnumRank = ranks.abbr.indexOf(newrank)
        newrank = ranks.name[newnumRank]
      }

    }else
    {
      message.reply(`${arguments[0]} is not a valid rank`)
      return;
    }
    var Nrank = guild.roles.cache.find((role) => {
      return role.name === newrank
    });
    var Orank = guild.roles.cache.find((role) => {
      return role.name === currentRank
    });
    var NCO = guild.roles.cache.find((role) => {
      return role.name === 'NCO'
    });
    var SNCO = guild.roles.cache.find((role) => {
      return role.name === "Senior-NCO"
    });
    var ANCO = guild.roles.cache.find((role) => {
      return role.name === "Admin-NCO"
    });
    var OFF = guild.roles.cache.find((role) => {
      return role.name === "Officer"
    });

    try
    {
      await sql.updateRank(discordid,newrankabbr)
      console.log(newnumRank)
      member.roles.add(Nrank)
      member.roles.remove(Orank)
      if((newnumRank)<8)
      {
        member.roles.remove(OFF);
        member.roles.remove(ANCO);
        member.roles.remove(NCO);
        member.roles.remove(SNCO);
      }
      if((newnumRank)>8&&(newnumRank)<11)
      {
        member.roles.add(NCO);
        member.roles.remove(SNCO);
        member.roles.remove(ANCO);
        member.roles.remove(OFF);
      }
      if((newnumRank>=11)&&(newnumRank<=13))
      {
        member.roles.add(SNCO);
        member.roles.remove(NCO);
        member.roles.remove(ANCO);
        member.roles.remove(OFF);
      }
      if((newnumRank>13&&newnumRank<16))
      {
        member.roles.add(ANCO);
        member.roles.remove(NCO);
        member.roles.remove(SNCO);
        member.roles.remove(OFF);
      }
      if((newnumRank>13&&newnumRank<16))
      {
        member.roles.add(ANCO);
        member.roles.remove(NCO);
        member.roles.remove(SNCO);
        member.roles.remove(OFF);
      }
      if(newnumRank>=16&&newnumRank<18)
      {
        member.roles.add(OFF);
        member.roles.remove(ANCO);
        member.roles.remove(NCO);
        member.roles.remove(SNCO);
      }
    await sql.updateRank(discordid,newrankabbr)
    message.reply(`${displayName} now has the rank ${newrank}`)
    }
    catch(e)
    {
      console.log(e);
    }

  },
  permissions: '',
  description:'Gives a user a specific rank',
  requiredRoles: ['Officer'],

}
