require('dotenv').config();
const sql = require('./sqlfunctions');
//require('./teamspeak');
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const prefix = '!';
bot.login(TOKEN);

const ranks = ['PVT','PFC','SPC4','SPC3','SPC2','SPC1','CPL','SGT','SSGT','SFC','MSGT','1SGT','SGM','2LT','1LT','CPT']
const certs = ['leadership','medical','engineering','communication','marksman','mortar','heavyweapons','armorcrew','aircrew']

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function commandinfo(msg,command){
  const rankup = '\nUsage: !rankup <@user> <optional rank> *Defaults to next rank*';
  const certify = '\n  Usage: !certify <@user> <certifcation>'

  switch(command){
    case 'rankup':
      msg.channel.send(rankup);
      break;
    case 'certify':
    msg.channel.send(certify);
    break;
    default:
      msg.channel.send('Available commands: \nCommand: !rankup' + rankup + '\nCommand: !certify'+ certify + ' ')
      /*
      msg.channel.send('')
      msg.channel.send(rankup);
      msg.channel.send('\nCommand: !certify')
      msg.channel.send(certify);
      */
    }
return
}

function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return bot.users.cache.get(mention);
	}
}

function getDiscordID(user){
  	if (!user) return;
  return user.id
}

async function rankup(msg,args,taggedUser){
  //Query SQL and update ranked
  if(taggedUser==undefined)
  {
    msg.reply("No user tagged.")
    commandinfo(msg,'rankup');
    return;
  }
  if(args.length<1){
    msg.reply("Not enough arguments provided.")
    commandinfo(msg,'rankup');
  }
  //successfully input command, now get the cases

  var DiscordID = getDiscordID(taggedUser);

  if(!args[1])
  {
    var currentRank = await sql.getRank(DiscordID);
    var numRank = ranks.indexOf(currentRank)
    msg.reply(`${taggedUser.username} was ranked up to ${ranks[numRank+1]}`);
    await sql.updateRank(DiscordID,ranks[numRank+1])
    //rankup to next rank
    return;
  }
  var inputrank = args[1].toUpperCase()
  if(ranks.includes(inputrank))
  {
    var newRank = inputrank;
    var numRank = ranks.indexOf(newRank)
    msg.reply(`${taggedUser.username} was ranked up to ${ranks[numRank]}`);
    sql.updateRank(DiscordID,ranks[numRank])
    //send rank to sql args[1]
    return;
  }
  else {
  msg.reply("Invalid Rank provided\nHere are the valid ranks:")
  msg.channel.send(`${ranks}`);
  }
}

async function certify(msg,args,taggedUser){
    if(taggedUser==undefined)
  {
    msg.reply("No user tagged.")
    commandinfo(msg,'certify');
    return;
  }
  if(args.length<2){
    msg.reply("Not enough arguments provided.")
    commandinfo(msg,'certify');
    return;
  }
  if(args.length>2){
    msg.reply("Too many arguments provided.")
    info(msg);
    return;
  }
  //succesfull command input
  var DiscordID = getDiscordID(taggedUser);
  var currentCerts = await sql.getCerts(DiscordID);
  var numCerts = currentCerts.length
  var certString = '';
  var inputcert = args[1].toLowerCase();
  console.log(inputcert);
  if(certs.includes(inputcert))
  {
    for(var i=0;i<numCerts;i++){
      if(currentCerts[i].Certification==inputcert){
        var hasCert = true;
        msg.channel.send(`<@${DiscordID}> already has this cert.`);
      }
    }
    if(!hasCert){
      await sql.addCert(DiscordID,inputcert)
    msg.channel.send(`<@${DiscordID}> was certified for ${inputcert.capitalize()}`);

    }

    //send cert to sql args[1]
    return;
  }
  else {
  msg.reply("Invalid certification provided\nHere are the valid certs:")
  msg.channel.send(`${certs}`);
  }

  return;
}

function ping(msg){
  msg.channel.send("Pinging...").then(m =>{
      // The math thingy to calculate the user's ping
    var ping = m.createdTimestamp - msg.createdTimestamp;

    // Basic embed
    var embed = new Discord.MessageEmbed()
    .setAuthor(`Pong!\n ${ping}ms`)
    .setColor("Your Color")

    // Then It Edits the message with the ping variable embed that you created
    m.edit(embed);
  });
}


bot.on('message', msg => {
  if (!msg.content.startsWith(prefix)) return;

  const withoutPrefix = msg.content.slice(prefix.length);
  const split = withoutPrefix.split(/ +/);
  const command = split[0];
  const args = split.slice(1);
  var taggedUser = getUserFromMention(args[0])
  var discordId = getDiscordID(taggedUser);
  switch(command){

      case 'info':
        commandinfo(msg);
        break;
      case 'ping':
        ping(msg);
        break;
      case 'rankup':
        rankup(msg,args,taggedUser);

        break;
      case 'certify':
        certify(msg,args,taggedUser);

        break;
      default:
        msg.reply('Not a valid command');
  }
});
