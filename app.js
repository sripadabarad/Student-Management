const express = require("express");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler.js")
const app = express();
const authRoutes = require("./routes/authRoutes.js");
const studentRoutes = require("./routes/studentRoutes.js");

//body parser
app.use(express.json());

//cookie
app.use(cookieParser())


//auth routes use
app.use("/api/auth",authRoutes);
app.use("/api/student",studentRoutes);

//global error handler (Last mein)
app.use(errorHandler);
module.exports = app ;
 