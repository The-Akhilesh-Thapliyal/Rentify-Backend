const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/credentials');
const router = require('./routes/routes');
const port = process.env.port || 8000;

// Connect to MongoDB
mongoose.connect(config.mongoURI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB");
});

// Middleware   
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:80',
    'https://localhost:443',
    'http://54.215.176.218:3000',
    'https://platform.rampex.in',
    // Add more origins as needed
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

