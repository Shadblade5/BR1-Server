const sql = require('../sqlfunctions')
const bot = require('../discordbot')
module.exports = {
  commands: ['getcerts'],
  expectedArgs: '<@user/ID>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 1,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var member
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
    //code starts here


    var currentcerts
    try{
      currentcerts = await sql.getCerts(discordid)
      for(var i=0;i<currentcerts.length;i++){
        currentcerts[i] = currentcerts[i].Cert.capitalize()+' ';
      }
          message.reply(`${displayName} has the following certs:\n ${currentcerts}`)
    }catch(e){
      message.reply(`Failed to get ${displayName}'s certs.`)
      console.log(e);
    }

  },
  permissions: '',
  description:'Gets the current certs of the User.',
  requiredRoles: ['Unit Member'],
}
