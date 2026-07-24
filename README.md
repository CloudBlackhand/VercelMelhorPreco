# MelhorPreço.net

Comparador de planos de internet por CEP.

## Rodar local (Docker)

Precisa só do Docker instalado.

```bash
docker compose up --build
```

Sobe o app, o Postgres e o Redis. Acesse http://localhost:3000.

O admin é criado automaticamente com as credenciais definidas no `docker-compose.yml`
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Painel em http://localhost:3000/admin.

## Deploy no Google Cloud (Cloud Run)

### 1. Pré-requisitos

- `gcloud` CLI instalado e autenticado (`gcloud auth login`)
- Um projeto no Google Cloud com billing ativo
- Um banco Postgres (Cloud SQL ou qualquer outro) e, opcionalmente, um Redis

### 2. Build e push da imagem

```bash
gcloud auth configure-docker southamerica-east1-docker.pkg.dev

docker build -t southamerica-east1-docker.pkg.dev/SEU_PROJETO/apps/melhorpreco:latest .
docker push southamerica-east1-docker.pkg.dev/SEU_PROJETO/apps/melhorpreco:latest
```

> Se ainda não existir o repositório de imagens:
> `gcloud artifacts repositories create apps --repository-format=docker --location=southamerica-east1`

### 3. Deploy

```bash
gcloud run deploy melhorpreco \
  --image southamerica-east1-docker.pkg.dev/SEU_PROJETO/apps/melhorpreco:latest \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "DATABASE_URL=postgresql://usuario:senha@host:5432/melhorpreco?schema=public" \
  --set-env-vars "NEXTAUTH_SECRET=gere-um-segredo-forte" \
  --set-env-vars "NEXTAUTH_URL=https://seu-dominio.com" \
  --set-env-vars "ADMIN_EMAIL=admin@melhorpreco.net" \
  --set-env-vars "ADMIN_PASSWORD=troque-esta-senha" \
  --set-env-vars "REDIS_URL=redis://host:6379"
```

O container aplica as migrations e cria o admin sozinho na subida. Não precisa rodar nada manual.

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | Conexão Postgres |
| `NEXTAUTH_SECRET` | Sim | Segredo de sessão (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Sim | URL pública do site |
| `ADMIN_EMAIL` | Não | Email do admin criado na subida |
| `ADMIN_PASSWORD` | Não | Senha do admin |
| `REDIS_URL` | Não | Cache. O app funciona sem ele |

### Cloud SQL

Se for usar Cloud SQL, adicione a flag no deploy:

```bash
  --add-cloudsql-instances SEU_PROJETO:southamerica-east1:NOME_DA_INSTANCIA
```

E use a `DATABASE_URL` no formato:

```
postgresql://usuario:senha@localhost/melhorpreco?schema=public&host=/cloudsql/SEU_PROJETO:southamerica-east1:NOME_DA_INSTANCIA
```

## Cobertura (KML)

Os mapas de cobertura ficam na pasta `KM/`. Para atualizar, troque os arquivos
`.kml`/`.kmz` e faça um novo build/deploy da imagem.
