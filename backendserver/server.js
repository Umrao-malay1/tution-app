require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const tutorsRouter = require('./routes/tutors');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/tutors', tutorsRouter);
app.use('/api/admin', adminRouter);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
