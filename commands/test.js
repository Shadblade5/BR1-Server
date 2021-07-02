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
    //---------------------------------------------------------------
    console.log(memberID)
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
    //console.log(servergroups)
    var currentawards = ''
    servergroups.forEach((groupid)=>{
      
      //console.log(groupid)
      var ranknum = ranks.groupid.indexOf(groupid)
      var certnum =  certs.groupid.indexOf(groupid)
      var awardnum = awards.groupid.indexOf(groupid)
      // console.log(`Rank ${ranknum}`)
      // console.log(`Cert ${certnum}`)
      // console.log(`Award ${awardnum}`)
      if(ranknum>=0)
      {
        console.log(ranks.name[ranknum])
      }
      if(certnum>=0)
      {
        console.log(certs.name[certnum])
      }
      if(awardnum>=0)
      {
        sql.addAward(memberID,awards.abbr[awardnum])
        currentawards += awards.name[awardnum] + ' '
      }
    })
    message.reply(currentawards)
    ts3id = await sql.getTS3ID(memberID)
    var groupids = ranks.groupid.concat(certs.groupid)
    //console.log(groupids)
 
    for(const groupid of groupids)
    {
      await teamspeak.addClientServerGroups(ts3id,groupid).catch((e)=>console.log(e))
    }
    

    for(const groupid of groupids)
    {
      await teamspeak.removeClientServerGroups(ts3id,groupid).catch((e)=>console.log(e))
    }
    
    sql.getRank(memberID).then((currentrank)=>
    {
      var groupid = ranks.groupid[ranks.abbr.indexOf(currentrank)]
      teamspeak.addClientServerGroups(ts3id,groupid).catch((e)=>console.log(e))
    })
    .then(()=>
    {
      sql.getCerts(memberID).then((currentcerts)=>
      {
        for(const cert of currentcerts)
        {
          groupid = certs.groupid[certs.abbr.indexOf(cert.Cert)]
          teamspeak.addClientServerGroups(ts3id,groupid)
        }
      })
    })
  },
  permissions: '',
  description:'Is simply a test',
  requiredRoles: ['Officer'],
}
