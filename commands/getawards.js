const sql = require('../sqlfunctions')
const medals = require('../info/medals.json')
module.exports = {
  commands: ['getawards'],
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
      message.reply('Please specify someone with a mention to get their awards.')
      console.log(e);
      return;
    }
    var currentawards
    try{
      currentawards = await sql.getMedals(targetUser.id)
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
