const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || process.argv[2];
  const password = process.env.ADMIN_PASSWORD || process.argv[3];
  const role = process.env.ADMIN_ROLE || process.argv[4] || "admin";

  if (!email || !password) {
    console.log("Uso: node scripts/create-admin.js <email> <senha> [role]");
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { senhaHash, role },
    create: { email, senhaHash, role },
  });

  console.log(`Admin pronto: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
