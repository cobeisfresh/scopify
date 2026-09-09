import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../db.ts'

const email = process.env.STAFF_SEED_EMAIL
const password = process.env.STAFF_SEED_PASSWORD
const name = process.env.STAFF_SEED_NAME ?? 'COBE Staff'

if (!email || !password) {
  throw new Error(
    'STAFF_SEED_EMAIL and STAFF_SEED_PASSWORD must be set in .env to seed a staff account',
  )
}

const passwordHash = await bcrypt.hash(password, 10)

await prisma.staffUser.upsert({
  where: { email },
  update: { passwordHash, name },
  create: { email, passwordHash, name },
})

console.log(`Staff account ready: ${email}`)
