const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors")
const session = require("express-session")
dotenv.config();
const connectDB = require("./connection");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const connectionRouter = require("./routes/connectionRequestRouter");
const userRouter = require("./routes/userRouter");
const app = express();
const http = require("http");
const initalizeSocket = require("./routes/socket");
const chatRouter = require("./routes/chatRouter");
const corsOptions={
  origin:process.env.FRONTEND_URL,
  credentials:true,
  optionsSuccessStatus: 200
}

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions))
app.set("trust proxy", 1);
app.use(session({
  secret:"some-secret",
  resave:false,
  saveUninitialized:false,
  cookie:{
    maxAge:7*24*60*60*1000,
    httpOnly:true,
    sameSite:'none',
    secure:true
  }
}))
app.use("/", authRouter);
app.use("/",profileRouter);
app.use("/",connectionRouter);
app.use("/",userRouter);
app.use("/",chatRouter)

const server = http.createServer(app)
initalizeSocket(server)
connectDB()
  .then(() => {
    console.log("Database connected successfully..");
    server.listen(8080, () => {
      console.log("server is listening on port 8080");
    });
  })
  .catch((err) => {
    console.log(err);
  });
