import express from 'express';
import { criarProduto, listarProdutos, venderProduto, calcularLucroTotal, listarProdutosPorData, calcularLucroTotalPorData, atualizarProduto, deletarProduto } from '../controllers/produtoController';
import { autenticarToken } from '../middleware/authMiddleware';
import { loginUsuario, registrarUsuario } from '../controllers/userController';

const produtoRoutes = express.Router();

// Rotas de autenticação
produtoRoutes.post('/registrar', registrarUsuario);
produtoRoutes.post('/login', loginUsuario);


// Rota para criar um produto
produtoRoutes.post('/', autenticarToken,criarProduto);

// Rota para listar todos os produtos
produtoRoutes.get('/', autenticarToken,listarProdutos);

// Rota para vender um produto
produtoRoutes.post('/vender', autenticarToken,venderProduto);

// Rota para calcular o lucro total
produtoRoutes.get('/relatorio/lucro', autenticarToken,calcularLucroTotal);

// Rota para listar produtos por intervalo de datas
produtoRoutes.get('/filtro-por-data', autenticarToken,listarProdutosPorData);

// Rota para calcular lucro por intervalo de datas
produtoRoutes.get('/relatorio/lucro-por-data', autenticarToken,calcularLucroTotalPorData);

// Rota para atualizar um produto
produtoRoutes.put('/:id', autenticarToken,atualizarProduto);

// Rota para deletar um produto
produtoRoutes.delete('/:id', autenticarToken,deletarProduto);

export default produtoRoutes;
