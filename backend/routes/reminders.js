const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MedicineReminder = require('../models/MedicineReminder');

router.post('/', auth, async (req, res) => {
  const { medicineName, dosage, time, frequency, days } = req.body;

  try {
    const reminder = new MedicineReminder({
      user: req.user.id,
      medicineName,
      dosage,
      time,
      frequency,
      days,
    });

    await reminder.save();
    res.json(reminder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const reminders = await MedicineReminder.find({ user: req.user.id, isActive: true });
    res.json(reminders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/:id', auth, async (req, res) => {
  const { medicineName, dosage, time, frequency, days, isActive } = req.body;

  try {
    let reminder = await MedicineReminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    if (reminder.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    if (medicineName) reminder.medicineName = medicineName;
    if (dosage) reminder.dosage = dosage;
    if (time) reminder.time = time;
    if (frequency) reminder.frequency = frequency;
    if (days) reminder.days = days;
    if (typeof isActive !== 'undefined') reminder.isActive = isActive;

    await reminder.save();
    res.json(reminder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await MedicineReminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    if (reminder.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    await reminder.deleteOne();
    res.json({ message: 'Reminder removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;