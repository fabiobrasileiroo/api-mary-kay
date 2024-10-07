import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import produtoRoutes from './routes/produtoRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(cookieParser());
// Rotas
app.use('/produtos', produtoRoutes);


// Middleware para cookies

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
