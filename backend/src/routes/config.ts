import express from 'express';
import Config from '../models/Config';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/', protect, admin, async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create(req.body);
    } else {
      config = await Config.findByIdAndUpdate(config._id, req.body, { new: true });
    }
    res.json(config);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
