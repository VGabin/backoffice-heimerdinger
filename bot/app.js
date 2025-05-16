import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { giveRole, removeRoles, onJoin, checkRoles } from "./app/roles.js";
import 'dotenv/config';
import { nodeCron as cron } from 'node-cron'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Register the slash command once (à lancer une fois)
const commands = [
  new SlashCommandBuilder()
    .setName('test')
    .setDescription('Répond avec un emoji !')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('refresh')
    .setDescription('Actualise manuellement les rôles.')
    .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('⏳ Enregistrement de la commande slash...');
    await rest.put(
      Routes.applicationCommands(process.env.APP_ID),
      { body: commands }
    );
    console.log('✅ Commande slash enregistrée !');
  } catch (err) {
    console.error(err);
  }
})();

// Event : quand le bot est prêt
client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  // cron.schedule('* * * * *', async () => {
  //   console.log("🕒 Cron lancé : vérification des rôles sur tous les serveurs.");

  //   await checkRoles(client);
  // });
});

client.on('guildMemberAdd', async (member) => {  
    await onJoin(member);
});

// Event : réponse à la commande slash
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'test') {
    const emojis = ['😎', '🚀', '🎉', '🔥'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    await interaction.reply(`Hello world ${randomEmoji}`);
  }

  if (interaction.commandName === 'refresh') {
    await checkRoles(client);

    await interaction.reply(`Rôles mis à jour`);
  }
});

// Event : voir tous les messages
client.on('messageCreate', message => {
  if (message.author.bot) return;
  console.log(`📨 ${message.author.tag} a envoyé : ${message.content}`);
});

client.login(process.env.DISCORD_TOKEN);
