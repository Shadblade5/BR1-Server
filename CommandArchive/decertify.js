const sql = require('../sqlfunctions')
const certs = require('../info/certs.json')
const bot = require('../discordbot')
module.exports = {
  commands: ['decertify'],
  expectedArgs: '<@user/ID> <certification>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 2,
  maxArgs: 2,
  callback: async(message, arguments, text) => {

    const { guild } = message
    
    var member
    var discordid;
    var displayName;
    
    member = message.guild.member(message.mentions.users.first() || bot.client.users.cache.find(user => user.id === arguments[0]))
    if(!member)
    {
      message.reply("Please provide a valid @mention or discordID of the target member.")
      return;
    }
    discordid = member.id;
    displayName = member.displayName || member.user.username;

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
          currentCertsSql = await sql.getCerts(discordid)
          currentCertsSql.forEach((element,i) => {
          currentCerts[i] = element.Certification.toString();
        });
          currentCertnum = currentCerts.indexOf(cert)
      }catch(e){
        message.reply(e)
        console.log(e)
      }
      if(0>=currentCertnum){
        message.reply(`${displayName} does not have the ${certName.capitalize()} Certification.`)
        return;
      }else{
        try{
          await sql.removeCert(discordid,cert)
          message.reply(`${displayName} has been decertified for ${certName.capitalize()}.`)
        }catch(e){
          console.log(e)
          message.reply(e)
        }

      }
    }

  },
  permissions: '',
  description:'Removes a Certification form the user.',
  requiredRoles: ['Head of Battalion','Co-Head of Battalion'],
}
