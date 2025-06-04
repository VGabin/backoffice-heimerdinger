require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");
const { onJoin, checkRoles } = require("./src/roles");
const cron = require('node-cron');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Register the slash command once (à lancer une fois)
const commands = [
  new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Actualise manuellement les rôles.")
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.APP_ID), {
      body: commands,
    });
  } catch (err) {
    console.error(err);
  }
})();

// Event : quand le bot est prêt
client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  cron.schedule('0 8 * * *', async () => {
    await checkRoles(client);
  });
});

client.on("guildMemberAdd", async (member) => {
  await onJoin(member);
});

// Event : réponse à la commande slash
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "refresh") {
    await checkRoles(client);

    await interaction.reply(`Rôles mis à jour`);
  }
});

client.login(process.env.DISCORD_TOKEN);
