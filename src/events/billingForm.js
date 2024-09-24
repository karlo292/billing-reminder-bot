const client = require('../index');
const billingModel = require('../models/billingModel');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'billingModal') {
        const billingDetails = interaction.fields.getTextInputValue('billingInput');
        const clientId = interaction.fields.getTextInputValue('clientId');
        const endDate = interaction.fields.getTextInputValue('endDate');

        const endDateInDays = Number(endDate);
        if (isNaN(endDateInDays)) {
            await interaction.reply({ content: 'Invalid end date provided.', ephemeral: true });
            return;
        }

        const endDateFormatted = new Date(Date.now() + endDateInDays * 24 * 60 * 60 * 1000);

        const newBilling = new billingModel({
            clientId: clientId,
            orderData: billingDetails,
            orderEndDate: endDateFormatted,
        });

        await newBilling.save();

        await interaction.reply({ content: 'Billing order created successfully!', ephemeral: true });
    }
});