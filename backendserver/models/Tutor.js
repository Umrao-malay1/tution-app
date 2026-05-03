const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    subjects: [{ type: String, trim: true }],
    city: { type: String, required: true, trim: true },
    area: { type: String, trim: true },
    feesPerMonth: { type: Number, required: true, min: 0 },
    teachingMode: {
      type: String,
      enum: ['home', 'online', 'both'],
      required: true,
    },
    classesTaught: { type: String, trim: true },
    experience: { type: String, trim: true },
    about: { type: String, trim: true },
    rating: { type: Number, default: 0, min: 0 },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tutor', tutorSchema);
