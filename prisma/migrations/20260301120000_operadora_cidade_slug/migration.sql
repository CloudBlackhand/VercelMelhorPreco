-- OperadoraCidade: operadora_id -> operadora_slug (referencia config por slug)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'operadora_cidades') THEN
    CREATE TABLE "operadora_cidades" (
      "id" TEXT NOT NULL,
      "operadora_slug" TEXT NOT NULL,
      "cidade" TEXT NOT NULL,
      "estado" TEXT,
      "ordem" INTEGER NOT NULL DEFAULT 0,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "operadora_cidades_pkey" PRIMARY KEY ("id")
    );
    CREATE UNIQUE INDEX "operadora_cidades_operadora_slug_cidade_estado_key" ON "operadora_cidades"("operadora_slug", "cidade", "estado");
    CREATE INDEX "operadora_cidades_cidade_estado_idx" ON "operadora_cidades"("cidade", "estado");
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'operadora_cidades' AND column_name = 'operadora_id') THEN
    ALTER TABLE "operadora_cidades" ADD COLUMN IF NOT EXISTS "operadora_slug" TEXT;
    UPDATE "operadora_cidades" oc SET "operadora_slug" = o.slug FROM "operadoras" o WHERE oc."operadora_id" = o.id;
    UPDATE "operadora_cidades" SET "operadora_slug" = 'desktop' WHERE "operadora_slug" IS NULL;
    ALTER TABLE "operadora_cidades" ALTER COLUMN "operadora_slug" SET NOT NULL;
    ALTER TABLE "operadora_cidades" DROP CONSTRAINT IF EXISTS "operadora_cidades_operadora_id_cidade_estado_key";
    ALTER TABLE "operadora_cidades" DROP CONSTRAINT IF EXISTS "operadora_cidades_operadora_id_fkey";
    ALTER TABLE "operadora_cidades" DROP COLUMN "operadora_id";
    CREATE UNIQUE INDEX "operadora_cidades_operadora_slug_cidade_estado_key" ON "operadora_cidades"("operadora_slug", "cidade", "estado");
    CREATE INDEX IF NOT EXISTS "operadora_cidades_cidade_estado_idx" ON "operadora_cidades"("cidade", "estado");
  END IF;
END $$;
