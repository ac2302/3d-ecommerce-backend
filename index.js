const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const _ = require("lodash");
const fileUpload = require("express-fileupload");
const config = require("./config");
const authMiddleware = require("./middlewares/auth");
const tokenMiddleware = require("./middlewares/token");

const app = express();

// middlewares
app.use(express.json());
app.use(cors({ exposedHeaders: "token" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
	fileUpload({
		createParentPath: true,
	})
);

// custom middlewares
app.use(authMiddleware);
app.use(tokenMiddleware);

// connect to db
mongoose.connect(config.db.string, (err) => {
	if (err) console.error(err);
	else console.log("connected to db");
});

// routes
app.use("/auth/", require("./routes/auth"));
app.use("/user/", require("./routes/user"));
app.use("/file/", require("./routes/file"));
app.use("/sellableitem/", require("./routes/sellableItem"));
app.use("printjob", require("./routes/printJob"));

app.listen(config.server.port, "0.0.0.0", () => {
	console.log(`server live on port ${config.server.port}`);
});

// clean DB
// setTimeout(cleanDB, config.db.cleanInterval);
