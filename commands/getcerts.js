const sql = require('../sqlfunctions')
const certs = require('../info/certs.json')
module.exports = {
  commands: ['getcerts'],
  expectedArgs: '<@user>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 1,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var member
    var targetUser
    try{
      targetUser = message.mentions.users.first()
      member = guild.members.cache.get(targetUser.id)
    }catch(e){
      message.reply('Please specify someone with a mention to get their certs.')
      console.log(e);
      return;
    }
    var currentcerts
    try{
      currentcerts = await sql.getMedals(targetUser.id)
      for(var i=0;i<currentcerts.length;i++){
        currentcerts[i] = ' '+medals.name[medals.abbr.indexOf(currentcerts[i].Medal.toString())]
      }
          message.reply(`${targetUser.tag} has the following certs:\n ${currentcerts}`)
    }catch(e){
      message.reply(`Failed to get ${targetUser.tag}'s certs.'`)
      console.log(e);
    }

  },
  permissions: '',
  description:'Gets the current certs of the User.',
  requiredRoles: [],
}
