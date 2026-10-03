const mongoose = require('mongoose');
const { Schema } = mongoose;

const User = mongoose.model('User', new Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'admin'], default: 'patient' }
}));

const Doctor = mongoose.model('Doctor', new Schema({
  name: { type: String, required: true },
  department: String,
  fee: Number,
  workingDays: [Number],
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' },
  slotDuration: { type: Number, default: 30 }
}));

const apptSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['booked', 'completed', 'cancelled'], default: 'booked' }
}, { timestamps: true });

// stops two people booking the same doctor, date and time
apptSchema.index(
  { doctor: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: 'booked' } }
);

const Appointment = mongoose.model('Appointment', apptSchema);

module.exports = { User, Doctor, Appointment };