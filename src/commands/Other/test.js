const { ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType} = require('discord.js');

module.exports = {
    name: 'test',
    description: "test.",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        interaction.reply('Hi, this is a command')
    }
};
