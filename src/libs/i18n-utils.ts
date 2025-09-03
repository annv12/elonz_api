import i18n from 'i18n'
import { Request } from 'express'
i18n.configure({
  locales: [
    'en',
    // 'vi',
    'es',
    'fr',
    'ja',
    'ko',
    'pt',
    'ru',
    'zh',
    'zh-TW',
    'ar',
    'th',
    'hi',
    'fil_PH',
  ],
  directory: __dirname + '/../locales',
  defaultLocale: 'en',
})

export function setLocale(req: any) {
  // console.log('ctx.request.headers: ', req.request.headers['set-cookie'])
  const requestLanguage = req?.headers?.['accept-language'] || 'en'
  i18n.setLocale(requestLanguage == 'ph' ? 'fil_PH' : requestLanguage)
  return i18n
}
