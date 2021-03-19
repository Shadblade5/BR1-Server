module.exports = {
  commands: ['adduser'],
  expectedArgs: '<@user> <TeamspeakID>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 2,
  callback: (message, arguments, text) => {
    const targetUser = message.mentions.users.first()
    const username = arguments[0]
    const discordName = targetUser.tag
    arguments.shift()
    const TeamspeakID = arguments[0];
    console.log(TeamspeakID);

  },
  permissions: '',
  requiredRoles: [],
}
