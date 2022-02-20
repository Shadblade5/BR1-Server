module.exports = {
  commands: ['restart'],
  expectedArgs: '',
  permissionError: '',
  minArgs: 0,
  maxArgs: 1,
  callback: async(message, arguments, text) => {

    process.exit(1);

  },
  permissions: '',
  description:'Restarts the bot',
  requiredRoles: ['Officer'],
}
