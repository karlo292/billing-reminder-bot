const {
    ApplicationCommandType,
    ApplicationCommandOptionType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require('discord.js');
const billingModel = require('../../models/billingModel');
module.exports = {
    name: 'billing',
    description: "billing",
    type: ApplicationCommandType.ChatInput,
    options: [{
            name: 'create',
            description: 'Create a billing order',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'orders',
            description: 'List all billing orders',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'delete',
            description: 'Delete a billing order',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'orderid',
                description: 'Enter the order ID',
                type: ApplicationCommandOptionType.String,
                required: true
            }]
        },
        {
            name: 'complete',
            description: 'Complete a billing order',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'orderid',
                description: 'Enter the order ID',
                type: ApplicationCommandOptionType.String,
                required: true
            }]

        }
    ],
    run: async (client, interaction) => {
        if (interaction.options.getSubcommand() === 'create') {
            const modal = new ModalBuilder()
                .setCustomId('billingModal')
                .setTitle('Create Billing Order');

            const clientId = new TextInputBuilder()
                .setCustomId('clientId')
                .setLabel("Enter client ID")
                .setStyle(TextInputStyle.Short);

            const billingInput = new TextInputBuilder()
                .setCustomId('billingInput')
                .setLabel("Enter billing details")
                .setStyle(TextInputStyle.Paragraph);

            const endDate = new TextInputBuilder()
                .setCustomId('endDate')
                .setLabel("Enter end date (in days)")
                .setStyle(TextInputStyle.Short);

            const actionRow1 = new ActionRowBuilder().addComponents(clientId);
            const actionRow2 = new ActionRowBuilder().addComponents(billingInput);
            const actionRow3 = new ActionRowBuilder().addComponents(endDate);

            modal.addComponents(actionRow1, actionRow2, actionRow3);

            await interaction.showModal(modal);
        } else if (interaction.options.getSubcommand() === 'orders') {
            const orders = await billingModel.find();
            const itemsPerPage = 5;
            let currentPage = 0;

            const generateEmbed = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const currentOrders = orders.slice(start, end);

                const embed = new EmbedBuilder()
                    .setTitle('Billing Orders')
                    .setDescription('List of all billing orders');


                currentOrders.forEach(order => {
                    embed.addFields({
                        name: `Order ID: ${order._id}`,
                        value: `Client ID: <@${order.clientId}>\nOrder Data:\n ${order.orderData}\n\nOrder End Date: ${order.orderEndDate}\n**Status: ${order.orderStatus}**`
                    });
                });

                return embed;
            };

            const embedMessage = await interaction.reply({
                embeds: [generateEmbed(currentPage)],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(orders.length <= itemsPerPage)
                    )
                ],
                fetchReply: true
            });

            const collector = embedMessage.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60000
            });

            collector.on('collect', async i => {
                if (i.customId === 'previous') {
                    currentPage--;
                } else if (i.customId === 'next') {
                    currentPage++;
                }

                await i.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                            new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled((currentPage + 1) * itemsPerPage >= orders.length)
                        )
                    ]
                });
            });

            collector.on('end', collected => {
                embedMessage.edit({
                    components: []
                });
            });
        } else if (interaction.options.getSubcommand() === 'delete') {
            const orderId = interaction.options.getString('orderid');

            if (!orderId) return interaction.reply({
                content: 'Please provide an order ID',
                ephemeral: true
            });

            const order = await billingModel.findById(orderId);
            if (!order) return interaction.reply({
                content: 'Order not found',
                ephemeral: true
            });

            await billingModel.findByIdAndDelete(orderId);
            await interaction.reply({
                content: 'Order deleted successfully!',
                ephemeral: true
            });
        } else if (interaction.options.getSubcommand() === 'complete') {
            const orderId = interaction.options.getString('orderid');

            if (!orderId) return interaction.reply({
                content: 'Please provide an order ID',
                ephemeral: true
            });

            const order = await billingModel.findById(orderId);
            if (!order) return interaction.reply({
                content: 'Order not found',
                ephemeral: true
            });

            await billingModel.findByIdAndUpdate(orderId, {
                orderStatus: 'completed'
            });
            await interaction.reply({
                content: 'Order completed successfully!',
                ephemeral: true
            });
        }

    }
};