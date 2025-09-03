const axios = require('axios')
import 'dotenv/config'
import Telegraf from 'telegraf'

export async function sendMessage(
  botToken: string,
  chatId: string,
  message: string,
) {
  try {
    let url = `https://api.telegram.org/bot${botToken}/sendMessage`
    await axios.get(url, {
      params: {
        chat_id: chatId,
        text: message,
      },
    })
  } catch (error) {
    console.log('chatId error: ', chatId)
  }
}

export async function sendNotifyAdmin(message: string) {
  const ids = (process.env.ADMIN_IDS as string) || ''
  const botToken = process.env.BOT_TOKEN_ADMIN as string
  ids
    .split(',')
    .forEach(
      async (chatId: string) => await sendMessage(botToken, chatId, message),
    )
}

const bot = new Telegraf(process.env.BOT_TOKEN_MELON)
export async function checkJoinTelegram(groupId: string, chatIdUser: number) {
  if (process.env.SKIP_JOIN) return true
  try {
    const user = await bot.telegram.getChatMember(groupId, chatIdUser)
    return user.status != 'left'
  } catch (error) {
    return false
  }
}
