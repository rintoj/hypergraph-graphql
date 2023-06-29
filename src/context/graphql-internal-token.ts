import { createHash } from 'crypto'

function md5Hex(data: string) {
  return createHash('md5').update(data).digest('hex')
}

const config = process.env.SERVICE_ACCOUNT_CONFIG ? require(process.env.SERVICE_ACCOUNT_CONFIG) : {}
export const INTERNAL_AUTH_TOKEN = config.private_key ? md5Hex(config.private_key) : undefined
