import { Router } from 'express';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import conversationRoutes from './conversation.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/conversations', conversationRoutes);

export default router;
