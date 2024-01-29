import jwt from 'jsonwebtoken';

export const generateAccessToken = payload => {
  if (!process.env.JWT_SECRET || `${process.env.JWT_SECRET}`.trim() === '') {
    throw new Error('JWT secret does not exist in environment');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS512', expiresIn: '45m' });
};
