import { useEffect, useState } from 'react';
import api from '../api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const emptyForm = { name: '', department: '', fee: '', workingDays: [1, 2, 3, 4, 5] };

export default function Admin() {
  const [doctors, setDoctors] = useState([]);
  const [appts, setAppts] = useState([]);
  const [msg, setMsg] = useState({ text: '', ok: false });
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    api.get('/doctors').then(res => setDoctors(res.data));
    api.get('/appointments').then(res => setAppts(res.data));
  };

  useEffect(() => { load(); }, []);

  const toggleDay = day => {
    const days = form.workingDays.includes(day)
      ? form.workingDays.filter(d => d !== day)
      : [...form.workingDays, day];
    setForm({ ...form, workingDays: days });
  };

  const addDoctor = async e => {
    e.preventDefault();
    setMsg({ text: '', ok: false });
    if (form.workingDays.length === 0)
      return setMsg({ text: 'Select at least one working day', ok: false });
    try {
      await api.post('/doctors', { ...form, fee: Number(form.fee) });
      setForm(emptyForm);
      setMsg({ text: 'Doctor added', ok: true });
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Could not add doctor', ok: false });
    }
  };

  const deleteDoctor = async id => {
    if (!window.confirm('Delete this doctor?')) return;
    await api.delete(`/doctors/${id}`);
    load();
  };

  const cancelAppt = async id => {
    if (!window.confirm('Cancel this appointment?')) return;
    await api.patch(`/appointments/${id}/cancel`);
    load();
  };

  const booked = appts.filter(a => a.status === 'booked').length;
  const cancelled = appts.filter(a => a.status === 'cancelled').length;

  return (
    <div>
      <div className="hero">
        <h1>Admin Dashboard</h1>
        <p>Manage doctors and all patient appointments.</p>
      </div>

      <div className="stats">
        <div className="stat"><div className="num">{doctors.length}</div><div className="label">Doctors</div></div>
        <div className="stat green"><div className="num">{booked}</div><div className="label">Active bookings</div></div>
        <div className="stat red"><div className="num">{cancelled}</div><div className="label">Cancelled</div></div>
      </div>

      <h2>Add Doctor</h2>
      <form className="card" onSubmit={addDoctor}>
        <div className="form-row">
          <input placeholder="Name (e.g. Dr. Iyer)" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Department" value={form.department}
            onChange={e => setForm({ ...form, department: e.target.value })} required />
          <input placeholder="Fee (₹)" type="number" value={form.fee}
            onChange={e => setForm({ ...form, fee: e.target.value })} required />
        </div>

        <p className="muted" style={{ margin: '0 0 8px' }}>Working days</p>
        <div className="chips">
          {DAYS.map((label, i) => (
            <button type="button" key={i}
              className={`chip ${form.workingDays.includes(i) ? 'active' : ''}`}
              onClick={() => toggleDay(i)}>
              {label}
            </button>
          ))}
        </div>

        <button type="submit" className="btn">Add Doctor</button>
        {msg.text && <div className={`msg ${msg.ok ? 'msg-ok' : 'msg-err'}`}>{msg.text}</div>}
      </form>

      <h2>Doctors</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Department</th><th>Fee</th><th>Days</th><th></th></tr>
          </thead>
          <tbody>
            {doctors.map(d => (
              <tr key={d._id}>
                <td><b>{d.name}</b></td>
                <td><span className="badge badge-dept">{d.department}</span></td>
                <td>₹{d.fee}</td>
                <td>{d.workingDays.map(i => DAYS[i]).join(', ')}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => deleteDoctor(d._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>All Appointments</h2>
      {appts.length === 0 ? (
        <div className="card empty"><span className="icon">📅</span>No appointments yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Patient</th><th>Email</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {appts.map(a => (
                <tr key={a._id}>
                  <td><b>{a.patient?.name}</b></td>
                  <td>{a.patient?.email}</td>
                  <td>{a.doctor?.name || '(deleted)'}</td>
                  <td>{a.date}</td>
                  <td>{a.timeSlot}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td>
                    {a.status === 'booked' && (
                      <button className="btn btn-danger btn-sm" onClick={() => cancelAppt(a._id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}