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


    arguments.shift()
    const cert = arguments[0].toLowerCase()
    const numCert = certs.name.indexOf(cert)
    const certName = cert
    var certnames = []
    for(var i=0;i<certs.name.length;i++){
      certnames[i] = ' '+certs.name[i].capitalize()
    }
    if(numCert<0){
      message.reply(`Invalid Certification. Here is a list of valid Certifications: \n${certnames}`)
      return;
    }else{
      var currentCerts = []
      var currentCertnum
      try{
          currentCertsSql = await sql.getCerts(memberID)
          currentCertsSql.forEach((element,i) => {
          currentCerts[i] = element.Certification.toString();
        });
          currentCertnum = currentCerts.indexOf(cert)
      }catch(e){
        message.reply(e)
        console.log(e)
      }
      if(0<=currentCertnum){
        message.reply(`${targetUser.tag} already has the ${certName.capitalize()} Certification.`)
        return;
      }else{
        try{
          await sql.addCert(memberID,cert)
          message.reply(`${targetUser.tag} has been certified for ${certName.capitalize()}.`)
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
