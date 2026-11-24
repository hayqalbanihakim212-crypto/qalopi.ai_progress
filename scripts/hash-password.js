import bcrypt from 'bcryptjs'
const pw = process.argv[2]
if (!pw || pw.length < 12) { console.error('Usage: npm run hash-password -- "<password of 12+ chars>"'); process.exit(1) }
console.log(bcrypt.hashSync(pw, 12))
