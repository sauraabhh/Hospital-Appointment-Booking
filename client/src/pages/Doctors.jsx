import { useEffect, useState } from 'react';
import api from '../api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Doctors() {
  const [all, setAll] = useState([]);
  const [dept, setDept] = useState('');
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [msg, setMsg] = useState({ text: '', ok: false });

  const today = new Date().toISOString().slice(0, 10);

  // load all doctors once; filter in the browser
  useEffect(() => {
    api.get('/doctors').then(res => setAll(res.data));
  }, []);

  const departments = [...new Set(all.map(d => d.department).filter(Boolean))];
  const doctors = dept ? all.filter(d => d.department === dept) : all;

  useEffect(() => {
    if (selected && date) {
      api.get(`/doctors/${selected._id}/slots`, { params: { date } })
        .then(res => setSlots(res.data))
        .catch(() => setSlots([]));
    }
  }, [selected, date]);

  const chooseDoctor = doctor => {
    setSelected(doctor);
    setDate('');
    setSlots([]);
    setMsg({ text: '', ok: false });
  };

  const book = async timeSlot => {
    try {
      await api.post('/appointments', { doctorId: selected._id, date, timeSlot });
      setMsg({ text: `Booked with ${selected.name} on ${date} at ${timeSlot}`, ok: true });
      setSlots(slots.filter(s => s !== timeSlot));
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Booking failed', ok: false });
    }
  };

  return (
    <div>
      <div className="hero">
        <h1>Find your doctor</h1>
        <p>Pick a specialist, choose a date, and book your slot instantly.</p>
      </div>

      <div className="toolbar">
        <h2 style={{ margin: 0 }}>Our Doctors ({doctors.length})</h2>
        <select value={dept} onChange={e => setDept(e.target.value)}>
          <option value="">All departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {doctors.length === 0 ? (
        <div className="card empty"><span className="icon">🩺</span>No doctors found.</div>
      ) : (
        <div className="grid">
          {doctors.map(d => (
            <div key={d._id} className={`doctor-card ${selected?._id === d._id ? 'selected' : ''}`}>
              <div className="doctor-top">
                <div className="avatar">{d.name.replace('Dr. ', '').charAt(0)}</div>
                <div>
                  <h3>{d.name}</h3>
                  <span className="badge badge-dept">{d.department}</span>
                </div>
              </div>
              <div className="days">Available: {d.workingDays.map(i => DAYS[i]).join(', ')}</div>
              <div className="doctor-meta">
                <span className="fee">₹{d.fee}</span>
                <button className="btn btn-sm" onClick={() => chooseDoctor(d)}>Book</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="card booking">
          <h3>Book with {selected.name}</h3>
          <p className="muted">{selected.department} · ₹{selected.fee} · {selected.startTime} to {selected.endTime}</p>

          <input
            type="date"
            min={today}
            value={date}
            onChange={e => { setDate(e.target.value); setMsg({ text: '', ok: false }); }}
          />

          {date && slots.length === 0 && (
            <div className="msg msg-err">No slots available on this date. Try another day.</div>
          )}

          {slots.length > 0 && (
            <>
              <p className="muted" style={{ marginBottom: 0 }}>Tap a time to book:</p>
              <div className="slots">
                {slots.map(s => (
                  <button key={s} className="slot" onClick={() => book(s)}>{s}</button>
                ))}
              </div>
            </>
          )}

          {msg.text && <div className={`msg ${msg.ok ? 'msg-ok' : 'msg-err'}`}>{msg.text}</div>}
        </div>
      )}
    </div>
  );
}