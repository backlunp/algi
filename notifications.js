var credentials = require(__dirname + "/credentials");

const TelegramBot = require("node-telegram-bot-api");

// replace the value below with the Telegram token you receive from @BotFather
const token = credentials.credentials.telegram;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: false });

const chatId = credentials.credentials.telegram.chatId;
bot.sendMessage(chatId, "Received your message" + chatId);
