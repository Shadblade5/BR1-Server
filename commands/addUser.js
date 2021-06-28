const sql = require('../sqlfunctions')
module.exports = {
  commands: ['adduser'],
  expectedArgs: '<@user/ID> <TeamspeakID>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 2,
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



    const username = arguments[0]
    const discordName = targetUser.tag
    const discordID = targetUser.id
    const rank = 'PVT'
    arguments.shift()
    const teamspeakID = arguments[0];
    try{
    await sql.addUser(discordName,discordID,teamspeakID,rank)
    message.reply(`${discordName} was successfully added to the database`)
    }catch(e){
    message.reply(e)
    }
  },
  permissions: '',
  description:'Adds a new user to the BR1 Database. TS3 ID is optional.',
  requiredRoles: ['Officer'],
}
