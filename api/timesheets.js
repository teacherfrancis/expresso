const express = require("express");
const sqlite3 = require("sqlite3");

const timesheetsRouter = express.Router();

const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

timesheetsRouter.get("/", (req, res, next) => {
  const employeeId = req.employee.id;

  db.all(
    "SELECT * FROM Timesheet WHERE employee_id = $employee_id",
    {
      $employee_id: employeeId,
    },
    (err, timesheets) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ timesheets: timesheets });
      }
    }
  );
});

timesheetsRouter.post("/", (req, res, next) => {
  const timesheet = req.body.timesheet;
  const employeeId = req.employee.id;

  if (timesheet && timesheet.hours && timesheet.rate && timesheet.date) {
    db.run(
      `
        INSERT INTO Timesheet (hours, rate, date, employee_id)
        VALUES ($hours, $rate, $date, $employee_id)
      `,
      {
        $hours: timesheet.hours,
        $rate: timesheet.rate,
        $date: timesheet.date,
        $employee_id: employeeId,
      },
      function (error) {
        if (error) {
          next(error);
        } else {
          db.get(
            "SELECT * FROM Timesheet WHERE id = $id",
            { $id: this.lastID },
            (error, timesheet) => {
              if (error) {
                next(error);
              }
              res.status(201).send({ timesheet: timesheet });
            }
          );
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

timesheetsRouter.param("timesheetId", (req, res, next, timesheetId) => {
  db.get(
    "SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId",
    { $timesheetId: timesheetId },
    (error, timesheet) => {
      if (error) {
        next(error);
      } else if (timesheet) {
        req.timesheet = timesheet;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  );
});

timesheetsRouter.put("/:timesheetId", (req, res, next) => {
  const timesheet = req.body.timesheet;
  const timesheetId = req.timesheet.id;
  const employeeId = req.employee.id;

  if (timesheet && timesheet.hours && timesheet.rate && timesheet.date) {
    db.run(
      `
        UPDATE Timesheet 
        SET hours = $hours, 
          rate = $rate, 
          date = $date, 
          employee_id = $employee_id
        WHERE id = $id
      `,
      {
        $id: timesheetId,
        $hours: timesheet.hours,
        $rate: timesheet.rate,
        $date: timesheet.date,
        $employee_id: employeeId,
      },
      (error) => {
        if (error) {
          next(error);
        } else {
          db.get(
            "SELECT * FROM Timesheet WHERE id = $id",
            { $id: timesheetId },
            (error, timesheet) => {
              if (error) {
                next(error);
              }
              res.status(200).send({ timesheet: timesheet });
            }
          );
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

timesheetsRouter.delete("/:timesheetId", (req, res, next) => {
  const timesheetId = req.timesheet.id;

  if (timesheetId) {
    db.run(
      `
        DELETE FROM Timesheet
        WHERE id = $id
      `,
      {
        $id: timesheetId,
      },
      (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

module.exports = timesheetsRouter;
