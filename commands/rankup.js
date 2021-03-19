module.exports = {
  commands: ['rankup', 'giverank'],
  expectedArgs: '<@user> <rank>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 2,
  maxArgs: 2,
  callback: (message, arguments, text) => {
    const targetUser = message.mentions.users.first()
    const username = arguments[0]
    const member = client.users.get('name',username);
    /*if(!targetUser) {
      message.reply('Please specify someone to give a role to.')
      return
    }else if(){

    }*/
    arguments.shift()

    const roleName = arguments.join(' ')
    const { guild } = message

    const role = guild.roles.cache.find((role) => {
      return role.name === roleName
    })
    if(!role) {
      message.reply(`There is no role with the name ${roleName}`)
      return;
    }

    else{

    }
    if(member.roles.cache.get(role.id)){
      member.roles.add(role)
      message.reply(`${targetUser.tag} now has the role ${role}`)
    }
    else{
      message.reply(`${targetUser.tag} alread has the role ${role}`)
    }



  },
  permissions: '',
  requiredRoles: [],
}
