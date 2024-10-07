import { Request, Response } from 'express';
import produtoService from '../services/produtoService';

export const calcularLucroTotal = async (req: Request, res: Response): Promise<void> => {
  try {
    const produtosVendidos = await produtoService.listarProdutosVendidos();

    let totalGasto = 0;
    let totalLucro = 0;

    produtosVendidos.forEach(produto => {
      const custoTotal = produto.valor_bruto + (produto.custo_deslocamento || 0) + (produto.custo_embalagem || 0) + (produto.custo_marketing || 0) + (produto.outros_custos || 0);

      // Verifica o tipo de lucro (percentual ou fixo)
      let lucroProduto = 0;
      if (produto.tipo_lucro === 'percentual') {
        lucroProduto = (produto.preco_venda - custoTotal) * (produto.porcentagem_lucro! / 100) * produto.quantidade;
      } else if (produto.tipo_lucro === 'fixo') {
        lucroProduto = produto.valor_lucro! * produto.quantidade;
      }

      totalGasto += custoTotal * produto.quantidade;
      totalLucro += lucroProduto;
    });

    const reinvestimento = totalLucro * 0.5;  // 50% para reinvestir
    const dinheiroPessoal = totalLucro * 0.5;  // 50% para dinheiro pessoal

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
