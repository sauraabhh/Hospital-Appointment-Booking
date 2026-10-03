What the project is

A hospital appointment booking web app. Patients book time slots with doctors online, and the admin manages doctors and all appointments.

Two roles:

Patient: register, log in, browse doctors, pick a date, book a free slot, view and cancel appointments
Admin: add or delete doctors, see every appointment, cancel any of them

How it works, step by step

1. Registering and logging in
The patient fills the form in React.
React sends the data to the Express server.
The server hashes the password with bcrypt and saves the user in MongoDB. The role is always patient.
On login, the server checks the password and sends back a JWT token (a signed proof of who you are).
React stores the token in the browser and attaches it to every later request.

2. Viewing doctors
The Doctors page asks the server for the doctor list.
Doctors are stored in MongoDB with their department, fee, working days, and working hours.
The department dropdown is built from the real doctor data.

3. Finding free time slots
The patient picks a doctor and a date.
The server calculates all slots from the doctor's start time, end time, and slot length (for example 09:00, 09:30, 10:00...).
It returns nothing if the date is in the past or the doctor doesn't work that day.
It then removes slots that already have a booked appointment.

4. Booking
The patient clicks a slot.
The server checks the slot is valid and saves the appointment.
MongoDB has a unique index on doctor + date + time for booked appointments. If two people click the same slot at the same moment, the database accepts one and rejects the other with a "Slot already booked" message.

5. My Appointments and cancelling
The patient sees only their own appointments.
Cancelling sets the status to cancelled, which frees the slot for others.
The server checks that a patient can only cancel their own appointment.

6. Admin panel
Only users with the admin role can open it.
Admin can add doctors, delete doctors, view all appointments with patient names, and cancel any.
This is enforced on the server, not only hidden in the UI.

The request flow : 
Browser (React) → Express API → Mongoose → MongoDB Atlas

The user clicks something in React.
Axios sends a request with the JWT token.
Express checks the token and the role.
Mongoose reads or writes the data in MongoDB.
The result returns to React, and the screen updates.
Tech stack and why each one is used

MongoDB (Atlas) is the database. It stores data as JSON-like documents, which fits JavaScript naturally. Atlas is free and hosted online, so nothing needs installing.

Express is the backend framework. It defines the API routes like /api/doctors and /api/appointments with very little code.

React is the frontend library. It builds the interface from reusable pieces and updates the page without reloading, which suits flows like pick doctor, pick date, pick slot.

Node.js runs JavaScript on the server, so the whole project uses one language.

Supporting libraries:

Vite creates and runs the React app fast, with instant reload on save.

Mongoose defines the data shapes (User, Doctor, Appointment) and connects Node to MongoDB. It also lets us create the unique index that stops double booking.

bcryptjs scrambles passwords before saving, so they can't be read even if the database leaks.

jsonwebtoken (JWT) creates the login token. The server doesn't need to remember sessions, because each request carries proof of identity and role.

dotenv keeps secrets (database password, JWT secret) in a .env file, out of the code and out of GitHub.

cors lets the frontend and backend, running on different addresses, talk to each other.

axios sends requests from React and automatically adds the token to each one.

react-router-dom gives separate pages (Doctors, My Appointments, Admin) without full page reloads.

nodemon restarts the server automatically when you save during developm
