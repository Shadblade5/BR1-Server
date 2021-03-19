module.exports = {
  commands: ['test'],
  expectedArgs: '<num1> <num2>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 0,
  callback: (message, arguments, text) => {
    const { guild } = message
    var roles = guild.roles.cache.each(role => console.log(role.name))
  },
  permissions: '',
  requiredRoles: [],
}
