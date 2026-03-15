
const dotenv = require("dotenv");
const app = require("./app");
const db = require("./config/db");

dotenv.config();
db();

// console.log("SMTP USER:", process.env.SMTP_USER);
// console.log("SMTP PASS:", process.env.SMTP_PASS);

// console.log("HOST:", process.env.SMTP_HOST);
// console.log("PORT:", process.env.SMTP_PORT);

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
});
