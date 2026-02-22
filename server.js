const app = require("./app");
const dotenv = require("dotenv");
const db = require("./config/db");

dotenv.config();
db();

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
});
