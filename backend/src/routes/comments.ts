import express from 'express';
import Comment from '../models/Comment';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/article/:articleId', async (req, res) => {
  try {
    const comments = await Comment.find({ articleId: req.params.articleId }).sort({ timestamp: -1 });
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req: AuthRequest, res) => {
  try {
    const comment = await Comment.create({
      ...req.body,
      authorUid: req.user._id
    });
    res.status(201).json(comment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }
    
    if (comment.authorUid.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comentario eliminado' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
