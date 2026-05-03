const express = require('express');
const mongoose = require('mongoose');
const Tutor = require('../models/Tutor');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { subject, city } = req.query;
    const filter = { isApproved: true };

    if (city && typeof city === 'string') {
      filter.city = new RegExp(`^${city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }

    if (subject && typeof subject === 'string') {
      filter.subjects = new RegExp(subject.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    const tutors = await Tutor.find(filter).sort({ createdAt: -1 }).lean();
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const tutor = new Tutor(req.body);
    await tutor.save();
    res.status(201).json(tutor);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid tutor id' });
    }

    const tutor = await Tutor.findOne({
      _id: id,
      isApproved: true,
    }).lean();

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    res.json(tutor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
