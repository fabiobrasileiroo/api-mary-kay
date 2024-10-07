import { Produto } from '@prisma/client';

import prisma from './prismaService';

interface ProdutoInput {
  nome: string;
  valor_bruto: number;
  porcentagem_lucro?: number;
  valor_lucro?: number;
  tipo_lucro: string;
  preco_venda: number;
  custo_deslocamento?: number;
  custo_embalagem?: number;
  custo_marketing?: number;
  outros_custos?: number;
  quantidade: number;
  userId: string;  // Relacionado ao usuário
}

const criarProduto = async (dadosProduto: ProdutoInput): Promise<Produto> => {
  return await prisma.produto.create({ data: dadosProduto });
};

const calcularLucro = (produto: Produto, quantidadeVendida: number): number => {
  let lucroUnitario = 0;
  
  if (produto.tipo_lucro === 'percentual') {
    lucroUnitario = (produto.preco_venda - produto.valor_bruto) * (produto.porcentagem_lucro! / 100);
  } else if (produto.tipo_lucro === 'fixo') {
    lucroUnitario = produto.valor_lucro!;
  }

  return lucroUnitario * quantidadeVendida;
};


const buscarProdutoPorId = async (id: string): Promise<Produto | null> => {
  return await prisma.produto.findUnique({ where: { id } });
};

const listarProdutosVendidos = async (): Promise<Produto[]> => {
  return await prisma.produto.findMany({ where: { status: 'vendido' } });
};

const listarTodosProdutos = async (userId: string) => {
  return await prisma.produto.findMany({
    where: { userId },  // Lista produtos do usuário autenticado
  });
};

const listarProdutosPorStatus = async (userId: string, status: string) => {
  return await prisma.produto.findMany({
    where: { userId, status },  // Lista produtos filtrados por status
  });
};

const listarProdutosPorData = async (dataInicio: Date, dataFim: Date): Promise<Produto[]> => {
  return await prisma.produto.findMany({
    where: {
      createdAt: {
        gte: dataInicio,  // "gte" significa "maior ou igual"
        lte: dataFim,     // "lte" significa "menor ou igual"
      },
    },
  });
};

const calcularLucroTotalPorData = async (dataInicio: Date, dataFim: Date): Promise<{ totalLucro: number, totalGasto: number }> => {
  const produtosVendidos = await prisma.produto.findMany({
    where: {
      status: 'vendido',
      updatedAt: {
        gte: dataInicio,
        lte: dataFim,
      },
    },
  });

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

  return { totalGasto, totalLucro };
};



const atualizarProduto = async (id: string, dadosAtualizados: Partial<Produto>): Promise<Produto | null> => {
  try {
    return await prisma.produto.update({
      where: { id },
      data: dadosAtualizados
    });
  } catch (error) {
    return null;  // Retorna null se o produto não for encontrado
  }
};

const deletarProduto = async (id: string): Promise<boolean> => {
  try {
    await prisma.produto.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    return false;  // Retorna falso se o produto não for encontrado
  }
};

export default { criarProduto,deletarProduto, buscarProdutoPorId, atualizarProduto, calcularLucro, listarProdutosVendidos,listarTodosProdutos,listarProdutosPorStatus, listarProdutosPorData, calcularLucroTotalPorData };
