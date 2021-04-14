const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')
const sql = require('./sqlfunctions')
//require('./teamspeak');
const loadCommands = require('./commands/load-commands')


client.on('ready', async () => {
  console.log('The client is ready!')
  await sql.connectToSQLServer();
  loadCommands(client);
})

client.login(config.token);


/*
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function commandinfo(msg,command){
  const rankup = `\n Usage: ${prefix}rankup <@user> <*optional* rank> *Defaults to next rank*`;
  const certify = `\n  Usage: ${prefix}certify <@user> <certification>`
  const decertify = `\n  Usage: ${prefix}decertify <@user> <certification>`
  const award = `\n  Usage: ${prefix}award <@user> <award>`
  const revoke = `\n  Usage: ${prefix}revoke <@user> <award>`
  const lookup = `\n  Usage: ${prefix}lookup <@user>`

  switch(command){
    case 'rankup':
      msg.channel.send(rankup);
      break;

    case 'certify':
      msg.channel.send(certify);
      break;

    case 'decertify':
      msg.channel.send(decertify);
      break;
    case 'award':
      msg.channel.send(award);
      break;

    case 'revoke':
      msg.channel.send(award);
      break;

    default:
      msg.channel.send('Available commands: \nCommand: rankup' + rankup + '\nCommand: certify'+ certify + '\nCommand: decertify' + decertify + '\nCommand: award'+ award + '\nCommand: revoke'+ revoke + '\nCommand: lookup'+ lookup + ' ')
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
    msg.reply(`${taggedUser.username} was ranked up to ${ranksE[numRank+1]}`);
    await sql.updateRank(DiscordID,ranks[numRank+1])
    //rankup to next rank
    return;
  }
  var inputrank = args[1].toUpperCase()
  if(ranks.includes(inputrank))
  {
    var newRank = inputrank;
    var numRank = ranks.indexOf(newRank)
    msg.reply(`${taggedUser.username} was ranked up to ${ranksE[numRank]}`);
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
    commandinfo(msg,'certify');
    return;
  }
  //succesfull command input
  var DiscordID = getDiscordID(taggedUser);
  var currentCerts = await sql.getCerts(DiscordID);
  var numCerts = currentCerts.length
  var certString = '';
  var inputcert = args[1].toLowerCase();
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

async function decertify(msg,args,taggedUser){
  if(taggedUser==undefined)
  {
    msg.reply("No user tagged.")
    commandinfo(msg,'decertify');
    return;
  }
  if(args.length<2){
    msg.reply("Not enough arguments provided.")
    commandinfo(msg,'decertify');
    return;
  }
  if(args.length>2){
    msg.reply("Too many arguments provided.")
    commandinfo(msg,'decertify');
    return;
  }
  //succesfull command input
  var DiscordID = getDiscordID(taggedUser);
  var currentCerts = await sql.getCerts(DiscordID);
  var numCerts = currentCerts.length
  var inputcert = args[1].toLowerCase();

  if(certs.includes(inputcert))
  {
    for(var i=0;i<numCerts;i++){
      if(currentCerts[i].Certification==inputcert){
        var hasCert = true;
      }
    }
    if(hasCert){
      await sql.removeCert(DiscordID,inputcert)
      msg.channel.send(`<@${DiscordID}> has been decertified of the ${inputcert.capitalize()} certification`);
    }
    if(!hasCert){
      await sql.addCert(DiscordID,inputcert)
    msg.channel.send(`<@${DiscordID}> does not have the ${inputcert.capitalize()} certification`);
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

async function award(msg,args,taggedUser){
  if(taggedUser==undefined)
  {
    msg.reply("No user tagged.")
    commandinfo(msg,'award');
    return;
  }
  if(args.length<2){
    msg.reply("Not enough arguments provided.")
    commandinfo(msg,'award');
    return;
  }
  if(args.length>2){
    msg.reply("Too many arguments provided.")
    commandinfo(msg,'award');
    return;
  }
  //syntax successfull
  var DiscordID = getDiscordID(taggedUser);
  var inputMedal = args[1].toUpperCase();
  var currentMedals = await sql.getMedals(DiscordID);
  var numMedals = currentMedals.length;

  if(medals.includes(inputMedal))
  {
    for(var i=0;i<numMedals;i++){
      if(currentMedals[i].Medal==inputMedal){
        var hasMedal = true;
        msg.channel.send(`<@${DiscordID}> already has this medal.`);
      }
    }
    if(!hasMedal){
      await sql.addMedal(DiscordID,inputMedal)

      var outputMedal = medalsE[medals.indexOf(inputMedal)];
    msg.channel.send(`<@${DiscordID}> was awarded ${outputMedal}`);

  }
  }  else {
    msg.reply("Invalid medal provided\nHere are the valid medals:")
    msg.channel.send(`${medals}`);
    }

}

async function revoke(msg,args,taggedUser){
  if(taggedUser==undefined)
  {
    msg.reply("No user tagged.")
    commandinfo(msg,'revoke');
    return;
  }
  if(args.length<2){
    msg.reply("Not enough arguments provided.")
    commandinfo(msg,'revoke');
    return;
  }
  if(args.length>2){
    msg.reply("Too many arguments provided.")
    commandinfo(msg,'revoke');
    return;
  }
  //syntax successfull
  var DiscordID = getDiscordID(taggedUser);
  var inputMedal = args[1].toUpperCase();
  var currentMedals = await sql.getMedals(DiscordID);
  var numMedals = currentMedals.length;

  if(medals.includes(inputMedal))
  {
    for(var i=0;i<numMedals;i++){
      if(currentMedals[i].Medal==inputMedal){
        var hasMedal = true;
      }
    }
    if(hasMedal){
      await sql.removeMedal(DiscordID,inputMedal)

      var outputMedal = medalsE[medals.indexOf(inputMedal)];
    msg.channel.send(`<@${DiscordID}> was revoked of the ${outputMedal}`);

  }
  }  else {
    msg.reply("Invalid medal provided\nHere are the valid medals:")
    msg.channel.send(`${medals}`);
    }

}

async function lookup(msg,args,taggedUser){
  if(taggedUser==undefined)
  {
    msg.reply("No user tagged.")
    commandinfo(msg,'lookup');
    return;
  }
  if(args.length<1){
    msg.reply("Not enough arguments provided.")
    commandinfo(msg,'lookup');
    return;
  }
  if(args.length>1){
    msg.reply("Too many arguments provided.")
    commandinfo(msg,'lookup');
    return;
  }

  //syntax successfull
  var DiscordID = getDiscordID(taggedUser);

  var currentRank = await sql.getRank(DiscordID);
  var currentCerts = await sql.getCerts(DiscordID);
  var currentMedals = await sql.getMedals(DiscordID);
  var numRank = ranks.indexOf(currentRank)
  var numCerts = currentCerts.length;
  var numMedals = currentMedals.length;

  msg.reply(`Here is the information on <@${DiscordID}>`)
  var string = '**Current Rank:** '
  if(currentRank=='None'||currentRank==undefined){
    string += 'No Rank'

  }else{
  string += ranksE[numRank];
  }
    string += '\n**Current Certifications:** ';
  if(currentCerts=='None'||currentCerts[0]==undefined){
    string += 'No certs'
  }
  else{
    string += currentCerts[0].Certification.capitalize()
    for(var i = 1;i<numCerts;i++){
      string += ', ' + currentCerts[i].Certification.capitalize()
    }
  }

  string += '\n**Current Awards:** '
  if(currentMedals=='None'||currentMedals[0]==undefined){
    string += 'No Awards'
  }
  else{
    string += medalsE[medals.indexOf(currentMedals[0].Medal)];

    for(var i = 1;i<numMedals;i++){
      string += ', ' + medalsE[medals.indexOf(currentMedals[i].Medal)];
    }
  }
  msg.channel.send(string);
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



  /*
  if (!msg.content.startsWith(prefix)) return;

  const withoutPrefix = msg.content.slice(prefix.length);
  const split = withoutPrefix.split(/ +/);
  const command = split[0];
  const args = split.slice(1);
  var taggedUser = getUserFromMention(args[0])
  var discordId = getDiscordID(taggedUser);
  switch(command){

      case 'help':
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

      case 'decertify':
        decertify(msg,args,taggedUser);
        break;

      case 'award':
          award(msg,args,taggedUser);
          break;

      case 'revoke':
          revoke(msg,args,taggedUser);
          break;

      case 'lookup':
          lookup(msg,args,taggedUser);
          break;

      default:
        msg.reply('Not a valid command');
  }

});*/
