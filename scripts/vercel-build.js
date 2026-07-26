const { spawnSync } = require("child_process");

function run(cmd) {
  console.log(`\n> ${cmd}`);
  const result = spawnSync(cmd, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`\nCommand failed with exit code ${result.status}: ${cmd}`);
    process.exit(result.status ?? 1);
  }
}

run("npx prisma generate");

if (process.env.DATABASE_URL) {
  run("npx prisma migrate deploy");
  run("npx tsx prisma/seed-kml.ts");

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    run("npx tsx scripts/create-admin.js");
  } else {
    console.warn("\n[vercel-build] ADMIN_EMAIL/ADMIN_PASSWORD não configurados. Pulando criação do admin.");
    console.warn("[vercel-build] Configure ADMIN_EMAIL e ADMIN_PASSWORD para criar o usuário admin automaticamente no deploy.");
  }
} else {
  console.warn("\n[vercel-build] DATABASE_URL não configurado. Pulando migrate deploy e seed-kml.");
  console.warn("[vercel-build] Configure DATABASE_URL nas variáveis de ambiente da Vercel para popular o banco de cobertura.");
}

run("npx next build");
