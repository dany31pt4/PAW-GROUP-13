// 1. DEPENDENCIES & MODULE IMPORTS
var createError = require('http-errors'); // Utility to create HTTP error objects
var express = require('express');         // The core Express framework 
var path = require('path');               // Node.js module to handle file paths
var cookieParser = require('cookie-parser'); // Middleware to parse cookies
var logger = require('morgan');           // HTTP request logger middleware
var mongoose = require('mongoose');       // ODM library for MongoDB 
require('dotenv').config();               // Loads environment variables from a .env file

// 2. ROUTER IMPORTS
// Importing the separate router modules to handle specific path prefixes
var indexRouter = require('./routes/index'); // Handles core/public routes
var usersRouter = require('./routes/users'); // Handles user-related routes
var authRouter = require('./routes/auth');   // Handles authentication routes (login, register)
var adminRouter = require('./routes/admin');   // Handles admin-specific routes (dashboard, approvals, etc.)
var apiRouter = require('./routes/api');   // Handles API routes (data endpoints for frontend JS)
// 3. DATABASE CONNECTION
// Establish connection to MongoDB using the URI stored in the .env file 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Db Connected..')) // Success callback
  .catch((err) => console.error(err));       // Error handling callback

// Initialize the Express application
var app = express();

// 4. VIEW ENGINE SETUP (EJS)
// Define where the template files are located and which engine to use 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 5. GLOBAL MIDDLEWARE
app.use(logger('dev'));                             // Logs requests to the console
app.use(express.json());                            // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: false }));   // Parses URL-encoded bodies (form data)
app.use(cookieParser());                            // Parses Cookie headers
app.use(express.static(path.join(__dirname, 'public'))); // Serves static files (CSS, JS, images)

// 6. ROUTE MOUNTING
// Map the imported routers to their specific base URLs
app.use('/', indexRouter);       // Base routes map to '/'
app.use('/users', usersRouter);  // User routes map to '/users'
app.use('/auth', authRouter);    // Auth routes map to '/auth'
app.use('/admin', adminRouter);  // Admin routes map to '/admin'
app.use('/api', apiRouter);  // API routes map to '/api'



// 7. ERROR HANDLING
// Catch 404 (Not Found) errors and forward them to the error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Global error handler middleware
app.use(function(err, req, res, next) {
  // Set locals: provides the error details only in the development environment
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the default error view 
  res.status(err.status || 500);
  res.render('error');
});

// Export the configured app so it can be started by the server file (usually /bin/www)
module.exports = app;