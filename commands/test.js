const sql = require('../sqlfunctions')
const medals = require('../info/medals.json')
const teamspeak = require('../teamspeak')
const { getStringDiff } = require('../discordbot')
module.exports = {
  commands: ['test'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 1,
  callback: async(message, arguments, text) => {
    const { guild } = message

    var member
    var memberID
    var wrongargs=false;
    try{
      targetUser = message.mentions.users.first()
      memberID = targetUser.id
      member = guild.members.cache.get(memberID)
      var wrongargs=false;
    }catch(e){
      //console.log(e);
      var wrongargs=true;
    }
      if(wrongargs)
      {
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

    //var roles = member.roles.cache.each(role=>console.log(`Role: ${role.id}`))

    var discordtag = member.user.tag  
    var discordname = discordtag.split('#')
    var diff
    var hit = false
    var difference=0
    var ts3id
    var clients
    
    clients = await teamspeak.getclients()
    
    do
    {
      clients.forEach(client =>
      {
        
        try
        {
        diff = getStringDiff(discordname[0].toString(),client.clientNickname.toString())
        }catch(e)
        {
          console.log(e)
        }
        if(diff<=difference){
          hit=true
          ts3id=client.clientUniqueIdentifier        
        }
      })
      difference++;
    }while(!hit)
    message.reply(`${discordname[0]}'s Ts3id is ${ts3id}`)
  },
  permissions: '',
  description:'Is simply a test',
  requiredRoles: ['Officer'],
}
