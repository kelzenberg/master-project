import express from 'express';
import { handler as protectedTestHandler } from '../handlers/protected/protected.js';

export const routes = express.Router().get('/protected', protectedTestHandler);
