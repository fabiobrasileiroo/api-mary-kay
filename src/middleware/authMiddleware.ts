// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export const autenticarToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Verifica se o token está no cookie
  const token = req.cookies?.token;
  console.log("🚀 ~ autenticarToken ~ token:", token)

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Decodifica o token JWT
    const usuarioDecodificado = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
    req.user = usuarioDecodificado; // Atribui o usuário decodificado à requisição
    next(); // Continua para o próximo middleware
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
