const express = require("express");
const cookieParser = require("cookie-parser");
// const session = require('express-session');
const bodyParser = require("body-parser");
const endpoints = require("express-list-routes");

// routes

const authRoute = require('./routes/AuthRoute');
const userRoute = require('./routes/UserRoute');
const orgRoute = require('./routes/OrgRoute');

const app = express();
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

// register routes
app.use('/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api', orgRoute);



console.log(endpoints(app));

module.exports = app;
