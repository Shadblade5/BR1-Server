const sql = require('../sqlfunctions')
const certs = require('../info/certs.json')
module.exports = {
  commands: ['decertify'],
  expectedArgs: '<@user> <certification>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 2,
  maxArgs: 2,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var member
    var targetUser
    try{
      targetUser = message.mentions.users.first()
      member = guild.members.cache.get(targetUser.id)
    }catch(e){
      message.reply('Please specify someone with a mention to give them an certification.')
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
          currentCertsSql = await sql.getCerts(targetUser.id)
          currentCertsSql.forEach((element,i) => {
          currentCerts[i] = element.Certification.toString();
        });
          currentCertnum = currentCerts.indexOf(cert)
      }catch(e){
        message.reply(e)
        console.log(e)
      }
      if(0>=currentCertnum){
        message.reply(`${targetUser.tag} does not have the ${certName.capitalize()} Certification.`)
        return;
      }else{
        try{
          await sql.removeCert(targetUser.id,cert)
          message.reply(`${targetUser.tag} has been decertified for ${certName.capitalize()}.`)
        }catch(e){
          console.log(e)
          message.reply(e)
        }

      }
    }

  },
  permissions: '',
  description:'Removes a Certification form the user.',
  requiredRoles: [],
}
