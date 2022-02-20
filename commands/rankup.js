const sql = require('../sqlfunctions')
const ranks = require('../info/ranks.json')
//const teamspeak = require('../teamspeak');
module.exports = {
  commands: ['rankup'],
  expectedArgs: '<@user/ID>',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 1,
  maxArgs: 1,
  callback: async(message, arguments, text) => {

    const { guild } = message
    var gmember
    var discordid
    var ggmember
    ggmember = message.guild.gmember(message.mentions.users.first() || bot.client.users.cache.find(user => user.id === arguments[0]))
    if(!ggmember)
    {
      message.reply("Please provide a valid @mention or discordID of the target gmember.")
      return;
    }
    discordid = ggmember.id;
    displayName = ggmember.displayName || ggmember.user.username;


    arguments.shift()
    var currentRank = ' '
    var currentRankabbr
    var authorUser = guild.gmembers.cache.get(message.author.id)
    if(discordid == authorUser.id && discordid != 208119044308467712)
    {
      message.reply(`You cannot rank yourself up.`)
      return
    }

    try{
      currentRankabbr = await sql.getRank(discordid)
      currentAuthorRankabbr = await sql.getRank(authorUser.id)
      //var ts3uid = await sql.getTs3
    }catch(e){
      message.reply(`User does not exist in the database`)
      console.log(e)
      return;
    }

    currentRank = ranks.name[ranks.abbr.indexOf(currentRankabbr)]
    const numRank = ranks.abbr.indexOf(currentRankabbr);
    const authNumRank = ranks.abbr.indexOf(currentAuthorRankabbr);
    console.log("Auth rank:"+authNumRank+" Numrank: "+(numRank+1))
    if(numRank+1>authNumRank)
    {
      message.reply(`You cannot rank up someone above your rank.`)
      return
    }

    const maxrank = 13;
    if(numRank == maxrank){
      message.reply(`${discordName} cannot be ranked up further`)
      return
    }

    //await teamspeak.removeClientServerGroups(ts3uid,ranks.groupid[numRank])
    //teamspeak.addClientServerGroups(ts3uid,ranks.groupid[numRank+1])

    const newrankabbr = ranks.abbr[numRank+1]
    var newrank = ranks.name[numRank+1]

      var Nrank = guild.roles.cache.find((role) => {
        return role.name === newrank
      });
      var Orank = guild.roles.cache.find((role) => {
        return role.name === currentRank
      });
      var NCO = guild.roles.cache.find((role) => {
        return role.name === 'NCO'
      });
      var SNCO = guild.roles.cache.find((role) => {
        return role.name === "Senior-NCO"
      });
        await sql.updateRank(discordid,newrankabbr)

        gmember.roles.add(Nrank)
        gmember.roles.remove(Orank)
        if((numRank+1)>7&&(numRank+1)<10)
        {
          gmember.roles.add(NCO);
        }
        if((numRank+1)>10)
        {
          gmember.roles.remove(NCO);
          gmember.roles.add(SNCO);
        }
        message.reply(`${displayName} now has the rank ${newrank}`)
      return;

  },
  permissions: '',
  description:'Ranks the user up to the next rank.',
  requiredRoles: ['Officer','Admin-NCO'],

}
