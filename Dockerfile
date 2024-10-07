# Usar a imagem oficial do Node.js da versão 22 (substitua quando disponível)
FROM node:22

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar o arquivo package.json e package-lock.json para o contêiner
COPY package*.json ./

# Instalar as dependências da aplicação
RUN npm install

# Copiar todo o código da aplicação para o contêiner
COPY . .

# Expor a porta que a aplicação vai usar
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
