require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const { cloudinary } = require("./utils/cloudinary");
const PORT = process.env.PORT || 3500;
const registerRouter = require("./routes/register");
const orderRoute = require("./routes/orderRoutes");

connectDB();

// Use the cors middleware
app.use(cors(corsOptions));

// Add headers for Cloudinary requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json({ limit: "50mb" }));

app.use(logger);

app.use(cors(corsOptions));

app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/root"));
app.use("/", registerRouter);
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/restorani", require("./routes/restoranRoutes"));
app.use("/menus", require("./routes/menuRoutes"));
app.use("/orders", orderRoute);

// upload image
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));

// app.get("/api/images", async (req, res) => {
//   const { resources } = await cloudinary.search
//     .expression("folder:restoran")
//     .sort_by("public_id", "desc")
//     .max_results(30)
//     .execute();

//   const publicIds = resources.map((file) => file.public_id);
//   res.send(publicIds);
// });
// app.post("/api/upload", async (req, res) => {
//   try {
//     const fileStr = req.body.data;
//     const uploadResponse = await cloudinary.uploader.upload(fileStr, {
//       upload_preset: "dev_setups",
//     });
//     console.log(uploadResponse);
//     res.json({ msg: "yaya" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ err: "Something went wrong" });
// //   }
// });

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
