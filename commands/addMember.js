const sql = require('../sqlfunctions')
const bot = require('../discordbot')
module.exports = {
  commands: ['addmember'],
  expectedArgs: '<@user/ID>',
  permissionError: '',
  minArgs: 1,
  maxArgs: 1,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var rank
    var sqlids
    rank = 'PVT';
    var discordid;
    var gmember;
    var displayName

    gmember = message.guild.member(message.mentions.users.first() || bot.client.users.cache.find(user => user.id === arguments[0]))
    if(!gmember)
    {
      message.reply("Please provide a valid @mention or discordID of the target member.")
      return;
    }
    discordid = gmember.id;
    displayName = gmember.displayName || gmember.user.username;
    
    var inDB = false;
    try
    {
      //TODO: Rework using SQL Query
      sqlids = await sql.getDiscordIDs()
      sqlids.forEach(id => {
        if(discordid==id.DiscordID){
          message.reply('Member is already in the Unit database.')
          inDB = true;
        }
      })
      if(!inDB)
      {

        //Give Unitmember and PVT Discord Roles
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
          gmember.roles.add(rankR);
          gmember.roles.add(memberR);
          gmember.roles.remove(fenceR);
        }catch(e)
        {
          console.log(e)
          console.log("Discord role add failed")
        }
        try{
        await sql.addUser(displayName,discordid,rank)
        message.reply(`${displayName} was successfully added to the Unit`)
        }catch(e)
        {
          console.log(e)
          message.reply("Error adding member to the Unit Database")
        }
      }
    }catch(e){
      console.log(e)
      message.reply("Error adding member to the Unit")
    }

  },
  permissions: '',
  description:'Adds a new user to the Unit.',
  requiredRoles: ['Officer','Admin-NCO','Senior-NCO','NCO'],
}
