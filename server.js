require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const connectdb = require("./db/connectdb");
const { apiRouter } = require("./routes/api.route");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { userRouter } = require("./routes/user.route");
const { authorizationUser } = require("./middleware/user.middleware");

const app = express();
const port = process.env.PORT || 2000;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },    
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" } 
  })
);
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://www.hosseinkhani20.ir",
      "https://api.hosseinkhani20.ir",
      "https://new-project-mu-ten.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1); 
app.use("/api/auth", apiRouter);
app.use("/api/user", authorizationUser ,userRouter);

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
