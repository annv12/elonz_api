import jwt from 'jsonwebtoken'

const privateKey = process.env.JWT_SECRET_KEY
const publicKey = process.env.JWT_PUBLIC_KEY

const i = 'Dragon' // Issuer
const s = 'admin@domain.com' // Subject
const a = 'https://domain.com' // Audience

export function sign(
  payload: string | object | Buffer,
  expiresTime: string = '15d',
) {
  if (!privateKey || !publicKey) {
    throw new Error('JWT_SECRET_KEY and JWT_PUBLIC_KEY are required')
  }

  const signOptions: jwt.SignOptions = {
    issuer: i,
    subject: s,
    audience: a,
    expiresIn: expiresTime,
    algorithm: 'RS256',
  }

  const token = jwt.sign(payload, privateKey as jwt.Secret, signOptions)

  return token
}

export function verify(token: string) {
  const verifyOptions: jwt.VerifyOptions = {
    issuer: i,
    subject: s,
    audience: a,
    algorithms: ['RS256'],
  }
  const legit = jwt.verify(token, publicKey as jwt.Secret, verifyOptions)

  return legit
}

export default { sign, verify, decode: jwt.decode }
