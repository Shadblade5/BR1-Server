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
    var member
    var targetUser

    var memberID
    var wrongargs=false;
    try
    {
      targetUser = message.mentions.users.first()
      member = guild.members.cache.get(targetUser.id)
      memberID = targetUser.id
      var wrongargs=false;
    }catch(e)
    {
      //console.log(e);
      var wrongargs=true;
    }
      if(wrongargs)
      {
        try
        {
          memberID = arguments[0]
          member = guild.members.cache.get(memberID)
          targetUser = member.user
          var wrongargs=false;
        }catch(e)
        {
          //console.log(e);
          var wrongargs=true;
        }
      }
    if(wrongargs)
    {
      message.reply('Please specify someone to run the command on')
      return;
    }

    arguments.shift()
    arguments[0] = arguments[0].toUpperCase()
    var newrank = arguments[0]

    var role
    var oldrole
    var currentAuthorRankabbr
    var currentRankabbr = ' '
    var currentRank

    var autherUser = guild.members.cache.get(message.author.id)
    if(memberID == autherUser.id && memberID != 208119044308467712)
    {
      message.reply(`You cannot rank yourself up.`)
      return
    }

    try
    {
    currentRankabbr = await sql.getRank(memberID)
    currentAuthorRankabbr = await sql.getRank(autherUser.id)
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
      return
    }

    if(numRank<0)
    {
        message.reply(`The rank ${newrank} does not exist, here is the list of ranks \n ${ranks.abbr}`)
        return;
    }

    const newrankabbr = ranks.abbr[numRank]

    if(newrank===currentRankabbr||newrank===ranks.name[ranks.abbr.indexOf(currentRankabbr)])
    {
      message.reply(`${targetUser.tag} is already the rank of ${currentRank}`)
      return;
    }

    if(0>ranks.abbr.indexOf(arguments[0])||0>ranks.name.indexOf(arguments[0]))
    {

      if(ranks.abbr.indexOf(arguments[0])>0)
      {
        newrank = ranks.name[ranks.abbr.indexOf(arguments[0])]
      }

    }else
    {
      message.reply(`${arguments[0]} is not a valid rank`)
      return;
    }

      role = guild.roles.cache.find((role) => {
        return role.name === newrank
      });
      oldrole = guild.roles.cache.find((role) => {
        return role.name === currentRank
      });

      member.roles.add(role);
      member.roles.remove(oldrole);

    await sql.updateRank(memberID,newrankabbr)
    message.reply(`${targetUser.tag} now has the rank ${newrank}`)
  },
  permissions: '',
  description:'Gives a user a specific rank',
  requiredRoles: ['Officer'],

}
