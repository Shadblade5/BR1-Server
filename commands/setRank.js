const sql = require('../sqlfunctions')
const ranks = require('../info/ranks.json')
module.exports = {
  commands: ['setrank'],
  expectedArgs: '<@user> <rank>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 2,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var member
    var targetUser
    try{
      targetUser = message.mentions.users.first()
      member = guild.members.cache.get(targetUser.id)
    }catch(e){
      message.reply('Please specify someone with a mention to give them a rank.')
      console.log(e);
      return
    }

    arguments.shift()
    arguments[0] = arguments[0].toUpperCase()
    var role
    var oldrole
    var currentRank = ' '
    try{
    currentRank = await sql.getRank(targetUser.id)
    }catch(e){
      message.reply(`User does not exist in the database`)
      console.log(e)
    }
    var newrank = arguments[0]
    const numRank = ranks.abbr.indexOf(newrank)
    console.log(numRank)
    if(numRank<0){
        message.reply(`The rank ${newrank} does not exist, here is the list of ranks \n ${ranks.abbr}`)
        return;
    }
    const newrankabbr = ranks.abbr[numRank]
    if(newrank===currentRank||newrank===ranks.name[ranks.abbr.indexOf(currentRank)]){
      message.reply(`${targetUser.tag} is already the rank of ${currentRank}`)
      return;
    }


      if(0>ranks.abbr.indexOf(arguments[0])||0>ranks.name.indexOf(arguments[0])){

        if(ranks.abbr.indexOf(arguments[0])>0){
          newrank = ranks.name[ranks.abbr.indexOf(arguments[0])]
        }
        console.log(currentRank)
      }else{
        console.log(ranks.abbr.indexOf(arguments[0]))
        console.log(ranks.name.indexOf(arguments[0]))
        message.reply(`${arguments[0]} is not a valid rank`)
        return;
      }

      role = guild.roles.cache.find((role) => {
        return role.name === newrank
      });
      oldrole = guild.roles.cache.find((role) => {
        return role.name === currentRank
      });
      console.log("New role: "+ role)
      console.log("Old role: " +oldrole)
//      member.roles.add(role);
//      member.roles.remove(oldrole);
    console.log("Got to the SQL!!")
    console.log(newrankabbr)
    await sql.updateRank(targetUser.id,newrankabbr)
    message.reply(`${targetUser.tag} now has the rank ${newrank}`)
  },
  permissions: '',
  requiredRoles: [],
}
