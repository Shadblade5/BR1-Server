const sql = require('../sqlfunctions')
const medals = require('../info/medals.json')
module.exports = {
  commands: ['getawards'],
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



    var currentawards
    try{
      currentawards = await sql.getMedals(memberID)
      for(var i=0;i<currentawards.length;i++){
        currentawards[i] = ' '+medals.name[medals.abbr.indexOf(currentawards[i].Medal.toString())]
      }
          message.reply(`${targetUser.tag} has the following awards:\n ${currentawards}`)
    }catch(e){
      message.reply(`Failed to get ${targetUser.tag}'s awards.'`)
      console.log(e);
    }

  },
  permissions: '',
  description:'Gets the current awards of the User.',
  requiredRoles: [],
}
