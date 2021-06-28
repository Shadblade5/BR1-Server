const sql = require('../sqlfunctions')
module.exports = {
  commands: ['updateTS3ID'],
  expectedArgs: '<@user/ID> <TeamspeakID>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 2,
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

    var teamspeakID

    arguments.shift()
    teamspeakID = arguments[0];

    try{
        await sql.updateTS3ID(memberID,teamspeakID)
        message.reply(`${discordName} was successfully updated with a TS3ID`)
    }catch(e){
        console.log(e)
        message.reply(e)
    }
  },
  permissions: '',
  description:"Updates a user's TS3ID",

  requiredRoles: ['Officer','Admin-NCO','Senior-NCO','NCO'],
}
