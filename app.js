// 1. DEPENDENCIES & MODULE IMPORTS
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var helmet = require("helmet");
var mongoSanitize = require("express-mongo-sanitize");
require("dotenv").config();

// 2. ROUTER IMPORTS
// Importing the separate router modules to handle specific path prefixes
var indexRouter = require("./routes/index"); // Handles core/public routes
var authRouter = require("./routes/auth"); // Handles authentication routes (login, register)
var adminRouter = require("./routes/admin"); // Handles admin-specific routes (dashboard, approvals, etc.)
var apiRouter = require("./routes/api"); // Handles API routes (data endpoints for frontend JS)
var supermarketRouter = require("./routes/supermarket"); // Handles supermarket-specific routes (registration, management, etc.)
var courierRouter = require("./routes/courier"); // Handles courier-specific routes
var customerRouter = require("./routes/customer");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./utils/swagger");
const { seedSuperAdmin } = require("./utils/seed");
// 3. DATABASE CONNECTION
// Establish connection to MongoDB using the URI stored in the .env file
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => { console.log("Db Connected.."); seedSuperAdmin(); })
  .catch((err) => console.error(err));

// Initialize the Express application
var app = express();

// 4. VIEW ENGINE SETUP (EJS)
// Define where the template files are located and which engine to use
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("view cache", false);

// 5. GLOBAL MIDDLEWARE
/*app.use(
  helmet({
    permissionsPolicy: {                   REMOVIDO ESTA A INTERFERIR COM O openstreetmap
      features: {
        geolocation: ["self"],
      },
    },
  }),
);*/
app.use(mongoSanitize());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// 6. ROUTE MOUNTING
// Map the imported routers to their specific base URLs
app.use("/", indexRouter); // Base routes map to '/'
app.use("/auth", authRouter); // Auth routes map to '/auth'
app.use("/admin", adminRouter); // Admin routes map to '/admin'
app.use("/api", apiRouter); // API routes map to '/api'
app.use("/supermarket", supermarketRouter); // Supermarket routes map to '/supermarket'
app.use("/courier", courierRouter); // Courier routes map to '/courier'
app.use("/customer", customerRouter);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { customSiteTitle: "Marketplace API Docs" }),
);

// 7. ERROR HANDLING
// Catch 404 (Not Found) errors and forward them to the error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Global error handler middleware
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  res.status(status);
  res.render("error", {
    status,
    message: err.message || "Erro interno do servidor.",
  });
});

// Export the configured app so it can be started by the server file (usually /bin/www)
module.exports = app;
