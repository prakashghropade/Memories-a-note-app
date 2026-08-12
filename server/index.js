// Load env variables
import { config } from "dotenv";
//if(process.env.NODE_ENV !== 'production'){
    config()


// Import dependencies
import express from "express";
import cors from "cors"
import connectToDb from "./config/connectToDb.js";
import { createNote, fetchNote, fetchNotes, updateNote, deleteNote } from "./controllers/notesController.js";
import { signup, login, logout, checkAuth } from "./controllers/usersController.js";
import CookieParser from "cookie-parser";
import { requireAuth } from "./middleware/requireAuth.js";

const {
    client,
    httpRequestsTotal,
    httpRequestDuration,
    httpRequestsInProgress
} = require('./metrics');

// Prometheus middleware
app.use((req, res, next) => {

    const start = process.hrtime();

    httpRequestsInProgress.inc();

    res.on('finish', () => {

        const diff = process.hrtime(start);

        const duration =
            diff[0] + diff[1] / 1e9;

        const route = req.route?.path || req.path;

        httpRequestsTotal.inc({
            method: req.method,
            route: route,
            status_code: res.statusCode
        });

        httpRequestDuration.observe(
            {
                method: req.method,
                route: route,
                status_code: res.statusCode
            },
            duration
        );

        httpRequestsInProgress.dec();
    });

    next();
});


// Create an express app
const app = express()

// Configure express app
app.use(express.json())
app.use(CookieParser())
app.use(cors({
    origin: true,
    credentials: true,
}))

// Connect to DB
connectToDb()


// Routing
app.get('/', (req, res) => {
    res.json("hello")
})
app.post('/signup', signup)
app.post('/login', login)
app.get('/logout', logout)
app.get('/check-auth', requireAuth, checkAuth)

app.get('/notes', requireAuth, fetchNotes)
app.get('/notes/:id', requireAuth, fetchNote)
app.post('/notes', requireAuth, createNote)
app.put('/notes/:id', requireAuth, updateNote)
app.delete('/notes/:id', requireAuth, deleteNote)


// metrics
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);

    res.end(await client.register.metrics());
});

// Start server
app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Server Started on ${process.env.PORT}`)
});

