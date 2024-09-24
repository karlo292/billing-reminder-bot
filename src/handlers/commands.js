const fs = require('fs');
const mongoose = require("mongoose");
const { PermissionsBitField } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const client = require('../index.js');
const rest = new REST({ version: '9' }).setToken(client.config.BOT_CONFIG.TOKEN);
const chalk = require('chalk');

module.exports = (client) => {
    const commands = [];
    fs.readdirSync('./src/commands').forEach(async dir => {
        const cmdFiles = fs.readdirSync(`./src/commands/${dir}`).filter(file => file.endsWith('.js'));

        for (const file of cmdFiles) {
            const cmd = require(`../commands/${dir}/${file}`);
            commands.push({
                name: cmd.name,
                description: cmd.description,
                type: cmd.type,
                options: cmd.options ? cmd.options : null,
                default_permission: cmd.default_permission ? cmd.default_permission : null,
                default_member_permissions: cmd.default_member_permissions ? PermissionsBitField.resolve(cmd.default_member_permissions).toString() : null
            });

            if (cmd.name) {
                client.commands.set(cmd.name, cmd);
            } else {
                console.log(chalk.red.bold(`                             \u2705 Client - Failed to load ${file.split('.js')[0]}`));
            }

        }
    });

    (async () => {
        try {
            await rest.put(client.config.BOT_CONFIG.GUILD_ID ?
                Routes.applicationGuildCommands(client.config.BOT_CONFIG.BOT_ID, client.config.BOT_CONFIG.GUILD_ID) :
                Routes.applicationCommands(client.config.BOT_CONFIG.GUILD_ID),
                { body: commands }
            );
            console.log(chalk.cyan.bold(`                             \u2705 Client - Slash Commands (/) registered`));
        } catch (e) {
            console.log(chalk.green.bold(`                             \u2705 Client - Failed to register application (/) commands`, e));
        }
    })();

    mongoose.connect(client.config.BOT_CONFIG.MONGO_URI).then(() =>     
       console.log(chalk.cyan.bold(`                             \u2705 Database - Mongoose connected`))
    )

};
