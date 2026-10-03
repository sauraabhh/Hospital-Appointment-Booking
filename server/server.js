require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Doctor, Appointment } = require('./models');const { protect, adminOnly } = require('./auth');
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true
}));

app.use(express.json());

app.get('/', (req, res) => res.send('Hospital API is running'));

// ---------- REGISTER ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6)
      return res.status(400).json({ message: 'Fill all fields (password min 6 chars)' });

    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hash });
    res.status(201).json({ message: 'Registered' });
  } catch (e) {
    if (e.code === 11000)
      return res.status(409).json({ message: 'Email already used' });
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- LOGIN ----------
app.post('/api/auth/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password)))
    return res.status(401).json({ message: 'Wrong email or password' });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.json({ token, user: { name: user.name, role: user.role } });
});

// ---------- TEST: confirms the token works ----------
app.get('/api/me', protect, (req, res) => res.json(req.user));

// ---------- DOCTORS ----------

// Anyone can view doctors (optional filter: ?department=Cardiology)
app.get('/api/doctors', async (req, res) => {
  const filter = req.query.department ? { department: req.query.department } : {};
  res.json(await Doctor.find(filter));
});

// Admin adds a doctor
app.post('/api/doctors', protect, adminOnly, async (req, res) => {
  try {
    res.status(201).json(await Doctor.create(req.body));
  } catch (e) {
    res.status(400).json({ message: 'Invalid doctor data' });
  }
});

// Admin deletes a doctor
app.delete('/api/doctors/:id', protect, adminOnly, async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ---------- SLOT HELPERS ----------
const toMin = t => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const toTime = n =>
  String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');

// All possible slots for a doctor on a date (booked ones not removed yet)
function allSlots(doc, date) {
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) return [];                          // past date
  const day = new Date(date + 'T00:00:00').getDay();    // 0=Sun ... 6=Sat
  if (!doc.workingDays.includes(day)) return [];        // doctor off that day

  const slots = [];
  for (let t = toMin(doc.startTime); t + doc.slotDuration <= toMin(doc.endTime); t += doc.slotDuration)
    slots.push(toTime(t));
  return slots;
}

// ---------- AVAILABLE SLOTS ----------
// Example: GET /api/doctors/DOCTOR_ID/slots?date=2026-10-12
app.get('/api/doctors/:id/slots', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const doc = await Doctor.findById(req.params.id);
    if (!doc || !date) return res.status(400).json({ message: 'Doctor or date missing' });

    const booked = await Appointment.find({ doctor: doc._id, date, status: 'booked' });
    const taken = booked.map(a => a.timeSlot);
    res.json(allSlots(doc, date).filter(s => !taken.includes(s)));
  } catch (e) {
    res.status(400).json({ message: 'Invalid request' });
  }
});

// ---------- BOOK ----------
app.post('/api/appointments', protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;
    const doc = await Doctor.findById(doctorId);
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    if (!allSlots(doc, date).includes(timeSlot))
      return res.status(400).json({ message: 'Not a valid slot' });

    const appt = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date,
      timeSlot
    });
    res.status(201).json(appt);
  } catch (e) {
    if (e.code === 11000)
      return res.status(409).json({ message: 'Slot already booked' });
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- MY APPOINTMENTS ----------
app.get('/api/appointments/mine', protect, async (req, res) => {
  const list = await Appointment.find({ patient: req.user.id })
    .populate('doctor', 'name department')
    .sort('-date');
  res.json(list);
});

// ---------- ALL APPOINTMENTS (admin) ----------
app.get('/api/appointments', protect, adminOnly, async (req, res) => {
  const list = await Appointment.find()
    .populate('doctor', 'name')
    .populate('patient', 'name email')
    .sort('-date');
  res.json(list);
});

// ---------- CANCEL ----------
app.patch('/api/appointments/:id/cancel', protect, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(appt.patient) !== req.user.id)
      return res.status(403).json({ message: 'Not your appointment' });

    appt.status = 'cancelled';
    await appt.save();
    res.json(appt);
  } catch (e) {
    res.status(400).json({ message: 'Invalid request' });
  }
});

// ---------- START ----------
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
  })
  .catch(err => console.log('DB error:', err.message));