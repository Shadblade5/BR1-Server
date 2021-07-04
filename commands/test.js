const sql = require('../sqlfunctions')
const awards = require('../info/awards.json')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const teamspeak = require('../teamspeak')
const functions = require('../discordbot')
module.exports = {
  commands: ['test'],
  expectedArgs: '',
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
    //---------------------------------------------------------------

    var ts3id
    var servergroups

    try
    {
    ts3id = await sql.getTS3ID(memberID)
    }catch(e)
    {
      console.error(e)
    }
    console.log(ts3id)
    try
    {
      servergroups = await teamspeak.getClientServerGroups(ts3id)
    }catch(e)
    {
      console.error(e)
    }

    var currentawards = ''
    for (const servergroup of servergroups)
    {
      var awardnum = awards.groupid.indexOf(servergroup)
      if(awardnum>=0)
      {
        var award = awards.abbr[awardnum]
        await sql.addAward(memberID,award)
      }
    }
    message.reply(currentawards)

    var groupids = ranks.groupid.concat(certs.groupid)
 
    //add all certs and ranks for testing purposes
    // for(const groupid of groupids)
    // {
    //   await teamspeak.addClientServerGroups(ts3id,groupid).catch((e)=>console.log(e))
    // }
    
    //clear out all certs and ranks

  },
  permissions: '',
  description:'Is simply a test',
  requiredRoles: ['Officer'],
}
