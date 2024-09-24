const fs = require('fs');
const chalk = require('chalk');

module.exports = (client) => {
    fs.readdirSync('./src/events').filter((file) => file.endsWith('.js')).forEach((event) => {
        require(`../events/${event}`);
    });

    console.log(chalk.cyan.bold(`                             \u2705 Client - Events loaded`));
}