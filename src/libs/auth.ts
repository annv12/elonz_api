import { Response, Request, NextFunction } from 'express'
import jwt from './jwt'

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers?.authorization
  if (!authHeader) {
    return res.status(401).send('Unauthorized')
  }
  const token = authHeader.replace('Bearer ', '')
  let verifiedToken: any
  try {
    verifiedToken = jwt.verify(token)
  } catch (error) {
    return res.status(401).send('Unauthorized')
  }

  if (!verifiedToken) {
    return res.status(401).send('Unauthorized')
  }

  // @ts-ignore
  req.userId = verifiedToken.userId

  return next()
}

export default isAuthenticated
