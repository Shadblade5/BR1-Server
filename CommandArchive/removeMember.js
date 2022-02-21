const sql = require('../sqlfunctions')
const bot = require('../discordbot')
module.exports = {
  commands: ['removemember'],

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


    try{
    await sql.removeUser(displayName,discordid)
    message.reply(`${displayName} was successfully removed from the database`)
    }catch(e){
    message.reply(e)
    }
    //discord remove?
  },
  permissions: '',
  description:'Removes a existing member from the Unit.',

  requiredRoles: ['Officer'],
}
