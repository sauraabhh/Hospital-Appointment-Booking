What the project is

A hospital appointment booking website.

Patients can create an account, see doctors, pick a date, choose a free time slot, book, and cancel.
Admin can add or delete doctors and see all appointments.

The special feature is that two people can't book the same doctor at the same time. The system blocks it automatically.

The tech stack (MERN)

MERN is four tools that all use JavaScript:

MongoDB is the database. It stores users, doctors, and appointments. We used MongoDB Atlas, which is free and online, so you don't have to install anything.

Express runs on the server and creates the API routes, like "get doctors" or "book appointment". It's simple and good for beginners.

React builds what the user sees: pages, buttons, forms. It updates the screen quickly without reloading the whole page.

Node.js lets JavaScript run on the server, so we can use one language for both frontend and backend.

Extra libraries and why we used them

Vite creates and runs the React app quickly.

Mongoose helps us define the shape of our data (User, Doctor, Appointment) and talk to MongoDB easily.

bcryptjs scrambles passwords before saving them, so nobody can read them even if the database leaks.

jsonwebtoken (JWT) gives the user a login token. Every request carries it, so the server knows who you are and whether you're a patient or admin.

dotenv keeps secrets like the database password in a .env file instead of in your code.

cors lets the React app (running on one port) talk to the server (running on another port). Browsers block this by default.

axios sends requests from React to the server and automatically attaches the login token.

react-router-dom gives you separate pages like Doctors, My Appointments, and Admin.

nodemon restarts the server automatically when you save a file.

How it all works together
You click something in the React page.
React sends a request to the Express server.
Express checks your login token and your role.
Express reads or saves data in MongoDB.
The answer goes back to React, and the screen updates.
