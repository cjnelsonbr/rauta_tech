# Rauta Tech - Assistência Técnica de Celulares

Sistema completo de gerenciamento de assistência técnica com catálogo de produtos, painel administrativo e integração com WhatsApp.

## 🚀 Características

- **Catálogo Público**: Visualização de produtos com filtros por categoria
- **Painel Administrativo**: Gerenciamento completo de produtos, categorias e usuários
- **Autenticação**: Login com email e senha
- **Integração WhatsApp**: Redirecionamento automático com mensagem preenchida
- **Design Responsivo**: Totalmente adaptado para mobile e desktop
- **Tema Verde Neon**: Design moderno com cores verde neon (#00FF00) e preto

## 📋 Pré-requisitos

- Node.js 18+ ou superior
- npm ou pnpm
- MySQL 8.0+ ou compatível
- Ubuntu 24 (para instalação em servidor)

## 🔧 Instalação Local

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/rauta_tech.git
cd rauta_tech
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="mysql://usuario:senha@localhost:3306/rauta_tech"

# JWT
JWT_SECRET="sua-chave-secreta-aqui-minimo-32-caracteres"

# Aplicação
VITE_APP_TITLE="Rauta Tech - Assistência Técnica"
VITE_APP_LOGO="https://seu-dominio.com/logo.png"
```

### 4. Criar Banco de Dados

```bash
# O banco será criado automaticamente na primeira execução
pnpm db:push
```

### 5. Executar em Desenvolvimento

```bash
pnpm dev
```

Acesse `http://localhost:3000` no navegador.

## 📦 Build para Produção

```bash
pnpm build
pnpm start
```

## 🐧 Instalação em Ubuntu 24 (Servidor Remoto)

### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar MySQL
sudo apt install -y mysql-server

# Instalar Git
sudo apt install -y git
```

### 2. Clonar e Configurar Projeto

```bash
# Criar diretório para a aplicação
mkdir -p /var/www/rauta_tech
cd /var/www/rauta_tech

# Clonar repositório
git clone https://github.com/seu-usuario/rauta_tech.git .

# Instalar dependências
pnpm install
```

### 3. Configurar MySQL

```bash
# Conectar ao MySQL
sudo mysql -u root

# Executar dentro do MySQL:
CREATE DATABASE rauta_tech;
CREATE USER 'rauta_user'@'localhost' IDENTIFIED BY 'sua-senha-segura';
GRANT ALL PRIVILEGES ON rauta_tech.* TO 'rauta_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
sudo nano .env
```

Adicione:

```env
DATABASE_URL="mysql://rauta_user:sua-senha-segura@localhost:3306/rauta_tech"
JWT_SECRET="gere-uma-chave-aleatoria-com-minimo-32-caracteres"
VITE_APP_TITLE="Rauta Tech - Assistência Técnica"
VITE_APP_LOGO="https://seu-dominio.com/logo.png"
NODE_ENV="production"
PORT=3000
```

### 5. Executar Migrações

```bash
pnpm db:push
```

### 6. Configurar PM2 (Gerenciador de Processo)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Criar arquivo de configuração
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rauta-tech',
    script: 'dist/server/_core/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/rauta-tech/error.log',
    out_file: '/var/log/rauta-tech/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Criar diretório de logs
sudo mkdir -p /var/log/rauta-tech
sudo chown $USER:$USER /var/log/rauta-tech

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar para iniciar automaticamente
pm2 startup
```

### 7. Configurar Nginx (Opcional)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/rauta_tech
```

Adicione:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/rauta_tech /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 8. Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática
sudo systemctl enable certbot.timer
```

## 👤 Primeiro Acesso

1. Acesse `/admin` no seu domínio
2. Use as credenciais padrão:
   - **Email**: admin@rauta.tech
   - **Senha**: admin123456

⚠️ **Importante**: Altere a senha padrão imediatamente após o primeiro acesso!

## 📱 Uso

### Painel Administrativo

- **Dashboard**: Visão geral do sistema
- **Categorias**: Gerenciar categorias e subcategorias
- **Produtos**: Adicionar, editar e remover produtos
- **Usuários**: Gerenciar usuários administrativos
- **2FA**: Configurar autenticação de dois fatores

### Catálogo Público

- Visualizar produtos por categoria
- Filtrar por subcategorias
- Clicar no produto para enviar mensagem via WhatsApp

## 🔐 Segurança

- Senhas são hash com bcrypt
- Autenticação por sessão com JWT
- Proteção CSRF em formulários
- Validação de entrada em todos os campos

## 📝 Estrutura do Projeto

```
rauta_tech/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários
│   └── public/            # Arquivos estáticos
├── server/                # Backend Express
│   ├── routers.ts         # Definição de rotas tRPC
│   ├── db.ts              # Funções de banco de dados
│   └── _core/             # Núcleo do servidor
├── drizzle/               # Migrações e schema do banco
└── shared/                # Código compartilhado
```

## 🆘 Troubleshooting

### Erro de Conexão com Banco de Dados

```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Verificar credenciais no .env
cat .env | grep DATABASE_URL
```

### Porta 3000 já em uso

```bash
# Encontrar processo usando a porta
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar outra porta
PORT=3001 pnpm dev
```

### Erro de Permissões

```bash
# Dar permissões corretas ao diretório
sudo chown -R $USER:$USER /var/www/rauta_tech
chmod -R 755 /var/www/rauta_tech
```

## 📞 Suporte

Para dúvidas ou problemas, entre em contato através do WhatsApp: **27 99768-1466**

## 📄 Licença

Propriedade da Rauta Tech - Assistência Técnica

## 🔄 Atualizações

Para atualizar o projeto:

```bash
# Puxar últimas mudanças
git pull origin main

# Instalar novas dependências
pnpm install

# Executar migrações
pnpm db:push

# Reiniciar aplicação
pm2 restart rauta-tech
```

---

**Desenvolvido com ❤️ para Rauta Tech**

