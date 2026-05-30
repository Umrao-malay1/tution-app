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
    const {
      name,
      phone,
      subjects,
      city,
      area,
      feesPerMonth,
      teachingMode,
      classesTaught,
      experience,
      about,
    } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ message: 'Phone is required.' });
    }
    if (!city || typeof city !== 'string' || !city.trim()) {
      return res.status(400).json({ message: 'City is required.' });
    }
    if (typeof feesPerMonth !== 'number' || feesPerMonth < 0) {
      return res.status(400).json({ message: 'feesPerMonth must be a number >= 0.' });
    }
    if (!Array.isArray(subjects) || subjects.length === 0 || subjects.some((s) => typeof s !== 'string' || !s.trim())) {
      return res.status(400).json({ message: 'subjects must be a non-empty array of strings.' });
    }

    const tutor = new Tutor({
      name: name.trim(),
      phone: phone.trim(),
      subjects: subjects.map((s) => s.trim()),
      city: city.trim(),
      area,
      feesPerMonth,
      teachingMode,
      classesTaught,
      experience,
      about,
      isApproved: false,
      rating: 0,
    });

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
