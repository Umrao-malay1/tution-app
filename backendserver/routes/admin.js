const express = require('express');
const mongoose = require('mongoose');
const Tutor = require('../models/Tutor');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.use(requireAdmin);

router.get('/tutors', async (req, res) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : 'pending';
    let filter = {};
    if (status === 'pending') filter.isApproved = false;
    else if (status === 'approved') filter.isApproved = true;
    else if (status !== 'all') {
      return res.status(400).json({ message: 'status must be pending, approved, or all' });
    }

    const tutors = await Tutor.find(filter).sort({ createdAt: -1 }).lean();
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/tutors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid tutor id' });
    }

    const { isApproved } = req.body;
    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ message: 'Body must include isApproved (boolean)' });
    }

    const tutor = await Tutor.findByIdAndUpdate(
      id,
      { $set: { isApproved } },
      { new: true }
    ).lean();

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    res.json(tutor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
