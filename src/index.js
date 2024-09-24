const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Colors,
  GuildMember,
  EmbedBuilder,
} = require('discord.js')
const cron = require('node-cron');

const billingModel = require('./models/billingModel');

const fs = require('fs');
const yaml = require('js-yaml');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],


});

process.on('unhandledRejection', error => {
  console.error(error);
});

client.on('shardError', error => {
  console.error(error);
});

require('events').EventEmitter.defaultMaxListeners = 0;


client.commands = new Collection();
client.config = yaml.load(fs.readFileSync('src/config.yml', 'utf8'));



module.exports = client;

fs.readdirSync('./src/handlers').forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});

// Schedule a task to run every 24 hours
cron.schedule('0 */12 * * *', async () => {
  try {
    let pendingOrders = await billingModel.find({ orderStatus: 'pending' });
    pendingOrders.forEach(order => {
      if (order.orderEndDate < Date.now()) {
        console.log(`Order ${order._id} is finished.`);
        const channel = client.channels.cache.get(client.config.BILLING_CHANNEL);
        const embed = new EmbedBuilder()
        .setTitle(`Order Finished: ${order._id}`)
        .setColor('#FF0000') // You can choose any color you like
        .addFields(
            { name: 'Client ID', value: `<@${order.clientId}>`, inline: true },
            { name: 'Order Data', value: order.orderData, inline: true },
            { name: 'Order End Date', value: new Date(order.orderEndDate).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
            }), inline: true },
            { name: 'Status', value: order.orderStatus, inline: true }
        )
        .setTimestamp();

        channel.send({ embeds: [embed] });
      }
    });
  } catch (error) {
    console.error('Error checking for pending orders:', error);
  }
});

client.login(client.config.BOT_CONFIG.TOKEN);