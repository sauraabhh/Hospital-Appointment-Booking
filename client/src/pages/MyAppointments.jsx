import { useEffect, useState } from 'react';
import api from '../api';

export default function MyAppointments() {
  const [list, setList] = useState([]);

  const load = () => api.get('/appointments/mine').then(res => setList(res.data));

  useEffect(() => { load(); }, []);

  const cancel = async id => {
    if (!window.confirm('Cancel this appointment?')) return;
    await api.patch(`/appointments/${id}/cancel`);
    load();
  };

  return (
    <div>
      <div className="hero">
        <h1>My Appointments</h1>
        <p>View and manage your bookings.</p>
      </div>

      {list.length === 0 ? (
        <div className="card empty">
          <span className="icon">📅</span>
          You have no appointments yet. Go to Doctors to book one.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Doctor</th><th>Department</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {list.map(a => (
                <tr key={a._id}>
                  <td><b>{a.doctor?.name || '(removed)'}</b></td>
                  <td>{a.doctor?.department}</td>
                  <td>{a.date}</td>
                  <td>{a.timeSlot}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td>
                    {a.status === 'booked' && (
                      <button className="btn btn-danger btn-sm" onClick={() => cancel(a._id)}>Cancel</button>
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