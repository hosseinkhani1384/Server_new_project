const express = require("express");
const jwt = require("jsonwebtoken");
const connectdb = require("./db/connectdb");
const { apiRouter } = require("./routes/api.route");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 2000;

const secret_key = process.env.SECRET_KEY;
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://www.hosseinkhani20.ir",
      "https://new-project-mu-ten.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.status(200).json({ ok: true });
});

const startServer = async () => {
  try {
    const dbUrl = process.env.URL;

    if (!dbUrl) {
      throw new Error(
        "Missing database connection string. Set MONGODB_URI or MONGO_URL.",
      );
    }

    await connectdb(dbUrl);
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server run on port ${port}`);
    });
  } catch (error) {
    console.error("can't start server", error.message);
    process.exit(1);
  }
};
startServer();
