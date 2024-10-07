// src/controllers/userController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../services/prismaService';

// Função para registrar um novo usuário
export const registrarUsuario = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  try {
    // Verifica se o usuário já existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Este e-mail já está registrado' });
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Cria um novo usuário
    const usuario = await prisma.user.create({
      data: {
        email,
        senha: senhaCriptografada,
      },
    });

    res.status(201).json({ message: 'Usuário registrado com sucesso', usuario });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

export const loginUsuario = async (req: Request, res: Response): Promise<void> => {
  const { email, senha } = req.body;

  try {
    const usuario = await prisma.user.findUnique({
      where: { email }
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    // Verifica se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      res.status(401).json({ error: 'Senha inválida' });
      return;
    }

    // Gerar token JWT
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    // Enviar o token como cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Apenas em produção
      maxAge: 3600000, // 1 hora
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Login bem-sucedido' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};
