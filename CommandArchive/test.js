const sql = require('../sqlfunctions')
const awards = require('../info/awards.json')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const ts3 = require('../teamspeak')
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
    var targetUser
    var memberID
    var wrongargs=false;
    
    // try
    // {
    //   targetUser = message.mentions.users.first()
    //   member = await guild.members.fetch(targetUser.id)
    //   memberID = targetUser.id
    //   wrongargs=false;
    // }catch(e){
    //   //console.log(e);
    //   wrongargs=true;
    // }
    // if(wrongargs)
    // {
    //   try{
    //     memberID = arguments[0]
    //     member = await guild.members.fetch(memberID)
    //     targetUser = member.user
    //     wrongargs=false;
    //   }catch(e){
    //     //console.log(e);
    //     wrongargs=true;
    //   }
    // }
    // if(wrongargs){
    //   message.reply('Please specify someone to run the command on')
    //   return;
    // }
    //---------------------------------------------------------------

    // var DISCORDRID;
    // var TSGROUPID;
    // var GROUPTYPE;
    // var NAME;
    // var ABBR;
    // console.log(ranks.name.length)
    //go through ranks
    // GROUPTYPE = 'RANK';
    // for(var i = 0;i<ranks.name.length;i++){
    //   console.log(i);
    //   DISCORDRID = ranks.discordid[i];
    //   TSGROUPID = ranks.groupid[i];
    //   NAME = ranks.name[i];
    //   ABBR = ranks.abbr[i];
    //   await sql.fillrole(DISCORDRID,TSGROUPID,GROUPTYPE,NAME,ABBR);
    // }
    // //go through certs
    // GROUPTYPE = 'CERT';
    // for(var i = 0;i<certs.name.length;i++){
    //   console.log(i);
    //   DISCORDRID = certs.discordid[i];
    //   TSGROUPID = certs.groupid[i];
    //   NAME = certs.name[i];
    //   ABBR = certs.abbr[i];
    //   await sql.fillrole(DISCORDRID,TSGROUPID,GROUPTYPE,NAME,ABBR);
    // }
    //  //go through awards
    // GROUPTYPE = 'AWARD';
    // for(var i = 0;i<awards.name.length;i++){
    //   console.log(i);
    //   //DISCORDRID = awards.discordid[i];
    //   TSGROUPID = awards.groupid[i];
    //   NAME = awards.name[i];
    //   ABBR = awards.abbr[i];
    //   await sql.fillrole(DISCORDRID,TSGROUPID,GROUPTYPE,NAME,ABBR);
    // }



    var array = await sql.querydb('RANK')

    console.log(array[0].NAME)
    

    

   


    



  },
  permissions: '',
  description:'Is simply a test',
  requiredRoles: ['Officer'],
}
