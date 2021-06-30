const sql = require('../sqlfunctions')
const medals = require('../info/medals.json')
module.exports = {
  commands: ['test'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 0,
  callback: async(message, arguments, text) => {

    var member = message.member
    var roles = member.roles.cache.each(role=>console.log(`Role: ${role.id}`))
    //roles.forEach(role => console.log(`Role: ${role}`))
    //console.log(roles)





  },
  permissions: '',
  description:'Is simply a test',
  requiredRoles: ['Officer'],
}
