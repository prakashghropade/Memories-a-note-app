// Load env variables
import { config } from "dotenv";
//if(process.env.NODE_ENV !== 'production'){
    config()


// Import dependencies
import express from "express";
import cors from "cors"
import crypto from "crypto";
import connectToDb from "./config/connectToDb.js";
import { createNote, fetchNote, fetchNotes, updateNote, deleteNote } from "./controllers/notesController.js";
import { signup, login, logout, checkAuth } from "./controllers/usersController.js";
import CookieParser from "cookie-parser";
import { requireAuth } from "./middleware/requireAuth.js";
import logger from "./helpers/logger.js";

import   {
    client,
    httpRequestsTotal,
    httpRequestDuration,
    httpRequestsInProgress
}  from "./metrics.js"


// Create an express app
const app = express()

// Prometheus middleware
app.use((req, res, next) => {

    const start = process.hrtime();
    const requestId = crypto.randomUUID();
    req.requestId = requestId;

    httpRequestsInProgress.inc();

    res.on('finish', () => {

        const diff = process.hrtime(start);

        const duration =
            diff[0] + diff[1] / 1e9;

        const route = req.route?.path || req.path;

        logger.info("http_request_completed", {
            requestId,
            method: req.method,
            path: req.path,
            route,
            statusCode: res.statusCode,
            durationMs: Math.round(duration * 1000),
            userAgent: req.get("user-agent"),
        });

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

app.get('/healthy', (req, res) => {
    res.json("hello healthy")
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
    logger.info("server_started", {
        port: process.env.PORT,
        environment: process.env.NODE_ENV || "development",
    });
});

