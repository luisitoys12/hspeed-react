import express from 'express';
import Request from '../models/Request';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const requests = await Request.find().sort({ timestamp: -1 });
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const request = await Request.create(req.body);
    res.status(201).json(request);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Petición no encontrada' });
    }
    res.json({ message: 'Petición eliminada' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
