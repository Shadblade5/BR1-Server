const sql = require('../sqlfunctions')
const awards = require('../info/awards.json')
const ranks = require('../info/ranks.json')
const certs = require('../info/certs.json')
const ts3 = require('../teamspeak')
const functions = require('../discordbot')
const { TeamSpeakQuery } = require('ts3-nodejs-library/lib/transport/TeamSpeakQuery')
module.exports = {
  commands: ['syncTS3ID'],
  expectedArgs: '',
  permissionError: 'You need admin permissions to run this command',
  minArgs: 0,
  maxArgs: 1,
  callback: async(message, arguments, text) => {
    var discordid = message.author.id;
    var lobbyclients = [];
    lobbyclients = await ts3.getLobbyClients();
    var clientdbid 
    clientdbid = await sql.getdbid(discordid);
    if(clientdbid>0)
    {
        message.reply("You are already synced");
    }
    else 
    if(clientdbid==undefined)
    {
        message.reply("You have not been added to the unit database"); 
    }
    else
    {
        var synced = false;
        for(i=0;i<lobbyclients.length;i++)
        {
            if(clientdbid == lobbyclients[i].propcache.clientDatabaseId)
            {
                if(lobbyclients[i].propcache.clientPlatform != 'ServerQuery')
                {
                    synced = true;
                    break;
                }
                
            }
        }
        if(!synced)
        {
            const IDs = [discordid];
            const promise = IDs.map((userID) => {
                return new Promise(async (resolve) => {
                    const member = message.guild.member(userID) || await message.guild.members.fetch(userID);
                    resolve(member.displayName || member.user.username);
                });
            });
            const discordname = await Promise.all(promise);
            for(i=0;i<lobbyclients.length;i++)
            {

                if(discordname == lobbyclients[i].propcache.clientNickname)
                {
                    try
                    {
                    await sql.updateDBID(discordid,lobbyclients[i].propcache.clientDatabaseId);
                    synced = true;
                    }catch(e)
                    {
                        console.log(e)
                    }
                    break;
                }
            } 
        }
        if(synced)
        {
            message.reply("You have been successfully synced on TS3");
        }
        else
        {
            message.reply("Syncing failed. Ensure your are in the teamspeak server lobby and your nickname in discord is EXACTLY the same as your teamspeak nickname.");
        }
    }
  },
  permissions: '',
  description:'Syncs your discord ID to your Teamspeak ID. Requires you to be in the lobby in TS3',
  requiredRoles: ['Officer'],
}
