const express = require("express");

const apiRouter = express.Router();

const employeesRouter = require("./employees");
apiRouter.use("/employees", employeesRouter);

const menuRouter = require("./menus");
apiRouter.use("/menus", menuRouter);

module.exports = apiRouter;
