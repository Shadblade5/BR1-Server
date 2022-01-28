const sql = require('../sqlfunctions')
const certs = require('../info/certs.json')
module.exports = {
  commands: ['getcerts'],
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
    //code starts here


    var currentcerts
    try{
      currentcerts = await sql.getCerts(memberID)
      for(var i=0;i<currentcerts.length;i++){
        currentcerts[i] = currentcerts[i].Cert.capitalize()+' ';
      }
          message.reply(`${targetUser.tag} has the following certs:\n ${currentcerts}`)
    }catch(e){
      message.reply(`Failed to get ${targetUser.tag}'s certs.`)
      console.log(e);
    }

  },
  permissions: '',
  description:'Gets the current certs of the User.',
  requiredRoles: [],
}
