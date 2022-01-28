const sql = require('../sqlfunctions')
const certs = require('../info/certs.json')
module.exports = {
  commands: ['certify'],
  expectedArgs: '<@user/ID> <certification>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 2,
  maxArgs: 2,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var member;
    var targetUser;
    var memberID;
    var wrongargs=false;
    var role;
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


    arguments.shift()
    var certName = arguments[0]
    var numCert = certs.name.indexOf(certName)
    var certabbr

    if(numCert<0){
      message.reply(`Invalid Certification. Here is a list of valid Certifications: \n${certs.names}`)
      return;
    }else{
      var currentCerts = []
      var currentCertnum
      // try{
      //     certabbr = await sql.getCerts(memberID)
      //     certabbr.forEach((element,i) => {
      //     currentCerts[i] = element.Cert.toString();});
      //     currentCertnum = currentCerts.indexOf(abbr)
      // }catch(e){
      //   message.reply(e)
      //   console.log(e)
      // }
      if(0<=currentCertnum){
        message.reply(`${targetUser.tag} already has the ${certName} Certification.`)
        return;
      }else{
        try{
          //await sql.addCert(memberID,certabbr)
          message.reply(`${targetUser.tag} has been certified for ${certName}.`)
          role = guild.roles.cache.find((role) => {
            message.reply(numCert +" " + certs.discordid[numCert]);
            return role.id === certs.discordid[numCert];
          });
          message.reply(role);
          member.roles.add(role);
        }catch(e){
          console.log(e)
          message.reply(e)
        }
      }
    }

  },
  permissions: '',
  description:'Gives the user a Certification',
  requiredRoles: ['Head of Battalion','Co-Head of Battalion'],
}
