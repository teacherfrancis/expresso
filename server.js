const express = require("express");
const app = express();

const PORT = process.env.PORT || 4000;

const cors = require("cors");
app.use(cors());

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const errorhandler = require("errorhandler");
app.use(errorhandler());

const morgan = require("morgan");
app.use(morgan("tiny"));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const apiRouter = require("./api/api");

app.use("/api", apiRouter);

module.exports = app;
