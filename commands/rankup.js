const sql = require('../sqlfunctions')
const ranks = require('../info/ranks.json')
module.exports = {
  commands: ['rankup'],
  expectedArgs: '<@user/ID>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 1,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var member
    var targetUser
    var memberID
    var wrongargs=false;
    try{
      targetUser = message.mentions.users.first()
      member = guild.members.cache.get(targetUser.id)
      memberID = targetUser.id
      var wrongargs=false;
    }catch(e){
      //console.log(e);
      var wrongargs=true;
    }
      if(wrongargs){
        try{
          memberID = arguments[0]
          member = guild.members.cache.get(memberID)
          targetUser = member.user
          var wrongargs=false;
        }catch(e){
          //console.log(e);
          var wrongargs=true;
        }
      }
    if(wrongargs){
      message.reply('Please specify someone to run the command on')
      return;
    }



    arguments.shift()
    var role
    var oldrole
    var currentAuthorRankabbr
    var currentRank = ' '
    var currentRankabbr
    var autherUser = guild.members.cache.get(message.author.id)
    if(memberID == autherUser.id && memberID != 208119044308467712)
    {
      message.reply(`You cannot rank yourself up.`)
      return
    }

    try{
      currentRankabbr = await sql.getRank(memberID)
      currentAuthorRankabbr = await sql.getRank(autherUser.id)
    }catch(e){
      message.reply(`User does not exist in the database`)
      console.log(e)
      return;
    }

    currentRank = ranks.name[ranks.abbr.indexOf(currentRankabbr)]
    const numRank = ranks.abbr.indexOf(currentRankabbr);
    const authNumRank = ranks.abbr.indexOf(currentAuthorRankabbr);

    if(numRank+1>authNumRank)
    {
      message.reply(`You cannot rank up someone above your rank.`)
      return
    }

    if(numRank == 15){
      message.reply(`${targetUser.tag} is already at the maximum rank of Captain`)
      return
    }

    const newrankabbr = ranks.abbr[numRank+1]
    var newrank = ranks.name[numRank+1]

      role = guild.roles.cache.find((role) => {
        return role.name === newrank
      });
      oldrole = guild.roles.cache.find((role) => {
        return role.name === currentRank
      });

        await sql.updateRank(memberID,newrankabbr)

        member.roles.add(role)
        member.roles.remove(oldrole)

        message.reply(`${targetUser.tag} now has the rank ${newrank}`)
      return;

  },
  permissions: '',
  description:'Ranks the user up to the next rank.',
  requiredRoles: ['NCO','Admin-NCO','Officer'],

}
