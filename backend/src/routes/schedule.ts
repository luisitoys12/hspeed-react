import express from 'express';
import Schedule from '../models/Schedule';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const schedule = await Schedule.find();
    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.status(201).json(schedule);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }
    res.json(schedule);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }
    res.json({ message: 'Horario eliminado' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
