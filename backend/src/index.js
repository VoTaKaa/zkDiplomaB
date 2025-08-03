const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const slug = require("mongoose-slug-generator");
const cors = require("cors");
const routes = require("./routes/index.js");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
mongoose.plugin(slug);

app.use(helmet());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"], // tuỳ ý thêm nếu cần
    allowedHeaders: ["Content-Type", "Authorization"], // tuỳ ý thêm nếu cần
    credentials: true, // nếu cần gửi cookie
  })
);

// Tăng giới hạn kích thước cho JSON body parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

routes(app);

mongoose
  .connect(`${process.env.MONGO_DB}`)
  .then(() => {
    console.log("Connect Db Successfully!");
  })
  .catch((error) => {
    console.log("Connect db failure!!!");
  });

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(port, () => {
  console.log("Server is running in port " + port);
});
