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

### 3.1 Configuração do Usuário Administrador (Padrão)

Para acessar o painel administrativo, é necessário criar um usuário com a função `admin`. Por padrão, o sistema não cria um usuário administrador automaticamente. Siga os passos abaixo para criar um usuário administrador com as credenciais padrão:

*   **Email:** `admin@rauta.tech`
*   **Senha:** `admin123456`

#### 3.2. Gerar o Hash da Senha

Primeiro, precisamos gerar o hash da senha padrão (`admin123456`) usando `bcrypt`.

1.  **Instale `bcrypt`:**
    Navegue até a raiz do projeto e instale a dependência `bcrypt`:
    ``` bash
    pnpm install bcrypt
    ``` 
2.  **Crie um script para gerar o hash:**
    Crie um arquivo chamado `generate_admin_hash.js` na raiz do seu projeto com o seguinte conteúdo:

``` bash
import bcrypt from "bcrypt";

const password = "admin123456"; // Senha padrão do administrador
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error("Erro ao gerar hash:", err);
    } else {
        console.log("Hash da senha gerado:", hash);
    }
});
```

3.  **Execute o script e copie o hash:**
    Execute o script usando `node`. O `package.json` do projeto define `"type": "module"`, então o `import` funcionará.
   ```bash
node generate_admin_hash.js 
 ```
    
**Você verá uma saída similar a esta:**
    Hash da senha gerado: $2b$10$SEU_HASH_GERADO_AQUI
    
**Copie o hash gerado** (a string que começa com `$2b$10$`). Você precisará dele no próximo passo.

#### 3.3. Inserir o Usuário Administrador no Banco de Dados

Agora que você tem o hash da senha, insira o usuário administrador diretamente no banco de dados MySQL.

1.  **Crie um script SQL para inserção:**
    Crie um arquivo chamado `insert_admin_user.sql` na raiz do seu projeto com o seguinte conteúdo. **Lembre-se de substituir `SEU_HASH_GERADO_AQUI` pelo hash que você copiou no passo anterior.**
    ```bash
    USE rauta_tech;

    INSERT INTO users (id, email, password, name, role, loginMethod) VALUES (
    CONCAT("user_", UNIX_TIMESTAMP(NOW()), "_", SUBSTRING(MD5(RAND()), 1, 9)),
    "admin@rauta.tech",
    "SEU_HASH_GERADO_AQUI", -- SUBSTITUA ESTE TEXTO PELO HASH REAL
    "Admin User",
    "admin",
    "email"
    );
    ```
    
2.  **Execute o script SQL:**
    Execute o script SQL usando o cliente MySQL. Certifique-se de estar no diretório raiz do seu projeto.
    ``` bash
    sudo mysql < insert_admin_user.sql
    ```
    Você deverá ver uma saída como Query OK, 1 row affected (...), indicando que o usuário foi inserido com sucesso.

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

