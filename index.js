const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { token, PORT, webAppUrl } = process.env;

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async msg => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Hello Human!', {
      reply_markup: {
        keyboard: [
          [{ text: 'Fill the form!', web_app: { url: webAppUrl + '/form' } }],
        ],

        inline_keyboard: [[{ text: 'Tap here!', web_app: { url: webAppUrl } }]],
      },
    });

    await bot.sendMessage(chatId, 'Welcome to our app !', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Tap here!', web_app: { url: webAppUrl } }]],
      },
    });
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);

      await bot.sendMessage(chatId, 'Thanks for feedback!');
      await bot.sendMessage(chatId, 'Your country: ' + data?.country);
      await bot.sendMessage(chatId, 'Your street: ' + data?.street);

      setTimeout(async () => {
        await bot.sendMessage(chatId, 'All information you find in this chat!');
      }, 3000);
    } catch (error) {}
  }
});

app.post('/web-data', async (req, res) => {
  const { queryID, products, totalPrice } = req.body;

  try {
    await bot.answerWebAppQuery(queryID, {
      type: 'article',
      id: queryID,
      title: 'Success buy',
      input_message_content: {
        message_text: 'Congratulations, You buy stuff for ' + totalPrice,
      },
    });

    return res
      .status(200)
      .send({ message: 'Congratulations, You buy stuff for ' + totalPrice });
  } catch (error) {
    // await bot.answerWebAppQuery(queryID, {
    //   type: 'article',
    //   id: queryID,
    //   title: error.message,
    //   input_message_content: {
    //     message_text: error.message,
    //   },
    // });

    return res.status(500).send({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
