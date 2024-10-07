import { Response } from 'express';
import produtoService from '../services/produtoService';  // Certifique-se de ter esse serviço configurado corretamente
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Função para criar um produto
export const criarProduto = async (req: AuthenticatedRequest, res: any): Promise<void> => {
  const {
    nome,
    valor_bruto,
    porcentagem_lucro,
    valor_lucro,
    tipo_lucro,
    preco_venda,
    custo_deslocamento,
    custo_embalagem,
    custo_marketing,
    outros_custos,
    quantidade,
  } = req.body;

  try {
    const userId = req.user?.id; // Acessa o userId do usuário autenticado
    console.log("🚀 ~ criarProduto ~ userId:", userId)

    if (!userId) {
      console.log("🚀 ~ criarProduto ~ userId:", userId)
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const produto = await produtoService.criarProduto({
      nome,
      valor_bruto,
      porcentagem_lucro,
      valor_lucro,
      tipo_lucro,
      preco_venda,
      custo_deslocamento,
      custo_embalagem,
      custo_marketing,
      outros_custos,
      quantidade,
      userId, // Relaciona o produto ao usuário autenticado
    });
      console.log("🚀 ~ criarProduto ~ userId:", userId)

    res.status(201).json(produto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
};

export const venderProduto = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id, quantidadeVendida } = req.body;
  console.log("🚀 ~ venderProduto ~ quantidadeVendida:", quantidadeVendida)
  console.log("🚀 ~ venderProduto ~ id:", id)
  const userId = req.user?.id;
  console.log("🚀 ~ venderProduto ~ userId:", req.user)

  // Verifique se o `userId` está presente
  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  try {
    const produto = await produtoService.buscarProdutoPorId(id);

    // Verifique se o produto pertence ao usuário autenticado
    if (!produto || produto.userId !== userId) {
      return res.status(404).json({ error: 'Produto não encontrado ou você não tem permissão para vendê-lo' });
    }

    const novaQuantidade = produto.quantidade - quantidadeVendida;
    const status = novaQuantidade <= 0 ? 'vendido' : 'em estoque';

    const produtoAtualizado = await produtoService.atualizarProduto(id, {
      quantidade: novaQuantidade,
      status,
    });

    const lucro = produtoService.calcularLucro(produto, quantidadeVendida);

    res.json({
      mensagem: 'Produto vendido com sucesso',
      produtoAtualizado,
      lucro,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao vender produto' });
  }
};
// Função para listar produtos
export const listarProdutos = async (req: AuthenticatedRequest, res: any): Promise<void> => {
  const { status } = req.query;
  const userId = req.user?.id;
  console.log("🚀 ~ listarProdutos ~ userId:", userId)
  console.log("🚀 ~ listarProdutos ~ userId:", userId)
  
  if (!userId) {
    console.log("🚀 ~ listarProdutos ~ userId:", userId)
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  try {
    let produtos;
    if (status) {
      produtos = await produtoService.listarProdutosPorStatus(userId, status as string);
      console.log("🚀 ~ listarProdutos ~ userId:", userId)
    } else {
      produtos = await produtoService.listarTodosProdutos(userId);
      console.log("🚀 ~ listarProdutos ~ userId:", userId)
    }
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
}

export const calcularLucroTotalPorData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { dataInicio, dataFim } = req.query;

  try {
    if (!dataInicio || !dataFim) {
      res.status(400).json({ error: 'Os parâmetros dataInicio e dataFim são obrigatórios.' });
      return;
    }

    const dataInicioDate = new Date(dataInicio as string);
    const dataFimDate = new Date(dataFim as string);

    const { totalGasto, totalLucro } = await produtoService.calcularLucroTotalPorData(dataInicioDate, dataFimDate);

    const reinvestimento = totalLucro * 0.5;  // 50% para reinvestir
    const dinheiroPessoal = totalLucro * 0.5;  // 50% para dinheiro pessoal

    res.json({
      totalGasto,
      totalLucro,
      reinvestimento,
      dinheiroPessoal,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular o relatório de lucro por data' });
  }
};



export const listarProdutosPorData = async (req: AuthenticatedRequest, res: any): Promise<void> => {
  const { dataInicio, dataFim } = req.query;

  try {
    if (!dataInicio || !dataFim) {
      res.status(400).json({ error: 'Os parâmetros dataInicio e dataFim são obrigatórios.' });
      return;
    }

    const dataInicioDate = new Date(dataInicio as string);
    const dataFimDate = new Date(dataFim as string);

    const produtos = await produtoService.listarProdutosPorData(dataInicioDate, dataFimDate);
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar produtos por data' });
  }
};



export const listarTodosProdutos = async (req: Request, res: Response): Promise<void> => {
  try {
    const produtos = await produtoService.listarProdutosVendidos();  // Antes listava só os vendidos
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
};




export const calcularLucroTotal = async (req: Request, res: any): Promise<void> => {
  try {
    const produtosVendidos = await produtoService.listarProdutosVendidos();

    let totalGasto = 0;
    let totalLucro = 0;

    produtosVendidos.forEach(produto => {
      const custoTotal = produto.valor_bruto + (produto.custo_deslocamento || 0) + (produto.custo_embalagem || 0) + (produto.custo_marketing || 0) + (produto.outros_custos || 0);

      let lucroProduto = 0;
      if (produto.tipo_lucro === 'percentual') {
        lucroProduto = (produto.preco_venda - custoTotal) * (produto.porcentagem_lucro! / 100) * produto.quantidade;
      } else if (produto.tipo_lucro === 'fixo') {
        lucroProduto = produto.valor_lucro! * produto.quantidade;
      }

      totalGasto += custoTotal * produto.quantidade;
      totalLucro += lucroProduto;
    });

    const reinvestimento = totalLucro * 0.5;
    const dinheiroPessoal = totalLucro * 0.5;

    res.json({
      totalGasto,
      totalLucro,
      reinvestimento,
      dinheiroPessoal,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular o relatório financeiro' });
  }
};
export const atualizarProduto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;  // O id agora é uma string (UUID)
  const { nome, valor_bruto, porcentagem_lucro, valor_lucro, tipo_lucro, preco_venda, custo_deslocamento, custo_embalagem, custo_marketing, outros_custos, quantidade } = req.body;

  try {
    const produtoAtualizado = await produtoService.atualizarProduto(id, {
      nome,
      valor_bruto,
      porcentagem_lucro,
      valor_lucro,
      tipo_lucro,
      preco_venda,
      custo_deslocamento,
      custo_embalagem,
      custo_marketing,
      outros_custos,
      quantidade
    });

    if (!produtoAtualizado) {
      res.status(404).json({ error: 'Produto não encontrado' });
      return;
    }

    res.json(produtoAtualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o produto' });
  }
};

export const deletarProduto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;  // O id agora é uma string (UUID)

  try {
    const produtoDeletado = await produtoService.deletarProduto(id);

    if (!produtoDeletado) {
      res.status(404).json({ error: 'Produto não encontrado' });
      return;
    }

    res.json({ mensagem: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar o produto' });
  }
};