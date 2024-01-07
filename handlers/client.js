const { Client, IntentsBitField } = require("discord.js");
const { readdirSync } = require("fs");

class BOTTRADE extends Client{
    constructor() {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
            ],
            allowedMentions: {
                repliedUser: false,
            },
        }) ;
    }
    start(token) {
        try {
            let eventCount = 0;
            readdirSync("./events")
                .filter((f) => f.endsWith(".js"))
                .forEach((event) => {
                    //console.log(`Loading event: ${event}`);
                    require(`../events/${event}`);
                    eventCount++;
                });
            console.log(`${eventCount} Events Loaded`);
          } catch (e) {
            console.log(e);
          }
        this.login(token)
    }
};

module.exports = BOTTRADE