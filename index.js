const { Client, Collection, Structures } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({
    disableEveryone: true
});

const Enmap = require('enmap');
client.guilddb = new Enmap({
    name: 'guilds'
});

(async function() {
    await client.guilddb.defer;
    console.log(guildEnmap + " guilds loaded");
});

if(guildEnmap.isReady){
    console.log('guildEnmap Ready');
} else {
    console.log('guildEnmap Not Ready');
}

const cooldowns = new Collection();

client.commands = new Collection();
client.aliases = new Collection();

client.module = fs.readdirSync('./commands');

Structures.extend('Guild', Guild => {
    class MusicGuild extends Guild{
        constructor(client, data){
            super(client, data);
            this.musicData = {
                queue: [],
                isPlaying: false,
                nowPlaying: null,
                songDispatcher: null,
                volume: 1
            };
        }
    }
    return MusicGuild;
});

["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

process.on('unhandledRejection', err => {
    console.error('Uncaught Promise Rejection', err);
});

client.on('ready', () => {
    console.log('r');
});

client.on('warn', info => console.log(info));
client.on('error', console.error);

client.on('message', async message => {
    const prefix = config.prefix;

    if(message.author.bot) return;
    if(!message.guild) return;
    if(!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if(cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if(!command) command = client.commands.get(client.aliases.get(cmd));

    if(!cooldowns.has(command.name)){
        cooldowns.set(command.name, new Collection());
    }

    if(command.category == 'BotOwner' && message.author.id !== config.ownerID) return message.channel.send('해당 명령어는 봇 소유자만 사용할 수 있습니다.');

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if(command){
        commmand.run(client, message, args);
    }
});

client.login(config.token);