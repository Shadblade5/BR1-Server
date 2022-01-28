const sql = require('../sqlfunctions')
module.exports = {
  commands: ['addmember'],
  expectedArgs: '<@user/ID> <TeamspeakID>',
  permissionError: '',
  minArgs: 1,
  maxArgs: 2,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var unitmemberid = '728023335744831549'
    var onthefenceid = '661748761952780304'
    var member
    var targetUser
    var memberID
    var wrongargs=false;
    var rank
    var teamspeakID
    var sqlids

    arguments.shift()
    teamspeakID = arguments[0];
    rank = 'PVT';

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
    const discordName = targetUser.tag
    var inDB = false;
    try
    {
      //TODO: Rework using SQL Query
      sqlids = await sql.getDiscordIDs()
      sqlids.forEach(id => {
        if(memberID==id.DiscordID){
          message.reply('Member is already in the Unit.')
          inDB=true;
        }
      })
      if(!inDB)
      {

        //TODO Give Unitmember and PVT Discord Roles
        try{
          var rankR = guild.roles.cache.find((role) => {
            return role.name === 'Private'
          });
          var memberR = guild.roles.cache.find((role) => {
            return role.name === 'Unit Member'
          });
          var fenceR = guild.roles.cache.find((role) => {
            return role.name === 'On the Fence'
          });
        member.roles.add(rankR);
        member.roles.add(memberR);
        member.roles.remove(fenceR);
        }catch(e)
        {
          console.log(e)
          console.log("Discord role add failed")
        }
        await sql.addUser(discordName,memberID,teamspeakID,rank)
        message.reply(`${discordName} was successfully added to the Unit`)
      }
    }catch(e){
      console.log(e)
      message.reply("Error adding member to the Unit")
    }

  },
  permissions: '',
  description:'Adds a new user to the Unit. TS3 ID is optional.',
  requiredRoles: ['Officer','Admin-NCO','Senior-NCO','NCO'],
}
