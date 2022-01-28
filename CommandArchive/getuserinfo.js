const sql = require('../sqlfunctions')
const certs = require('../info/certs.json')
const awards = require('../info/awards.json')
const ranks = require('../info/ranks.json')
module.exports = {
  commands: ['getuserinfo'],
  expectedArgs: '<@user/ID>',
  permissionError: '',
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

    var currentcerts
    var currentawards
    var currentRank
    try{
      currentRank = await sql.getRank(targetUser.id)
      const numRank = ranks.abbr.indexOf(currentRank)
      currentRank = ranks.name[numRank]
      currentawards = await sql.getAwards(targetUser.id)
      currentcerts = await sql.getCerts(targetUser.id)
      for(var i=0;i<currentcerts.length;i++){
        currentcerts[i] = certs.name[certs.abbr.indexOf(currentcerts[i].Cert.toString())] + ' '
      }
      for(var i=0;i<currentawards.length;i++){
        currentawards[i] = awards.name[awards.abbr.indexOf(currentawards[i].Award.toString())] + ' '
      }
      message.reply(`Here is ${targetUser.tag} info:\nCurrent Rank:\n${currentRank}\nCurrent certs:\n${currentcerts}\nCurrent awards:\n${currentawards}\n`)

    }catch(e){
      message.reply(`Failed to get ${targetUser.tag}'s info.\nError: ${e}`)
      console.log(e);
    }
    
    var ts3
    var servergroups

    try
    {
    ts3 = await sql.getTS3ID(memberID)
    }catch(e)
    {
      console.error(e)
    }
    console.log(ts3[0].TeamspeakID)
    try
    {
      servergroups = await teamspeak.getClientServerGroups(ts3[0].TeamspeakID)
    }catch(e)
    {
      console.error(e)
    }
    

  },
  permissions: '',
  description:'Gets the current certs of the User.',
  requiredRoles: [],
}
