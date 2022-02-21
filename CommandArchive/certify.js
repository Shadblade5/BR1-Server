const sql = require('../sqlfunctions')
const certs = require('../info/certs.json')
const bot = require('../discordbot')
module.exports = {
  commands: ['certify'],
  expectedArgs: '<@user/ID> <certification>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 2,
  maxArgs: 2,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var role;

    var discordid;
    var member;
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
      //     certabbr = await sql.getCerts(discordid)
      //     certabbr.forEach((element,i) => {
      //     currentCerts[i] = element.Cert.toString();});
      //     currentCertnum = currentCerts.indexOf(abbr)
      // }catch(e){
      //   message.reply(e)
      //   console.log(e)
      // }
      if(0<=currentCertnum){
        message.reply(`${displayName} already has the ${certName} Certification.`)
        return;
      }else{
        try{
          //await sql.addCert(discordid,certabbr)
          message.reply(`${displayName} has been certified for ${certName}.`)
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
