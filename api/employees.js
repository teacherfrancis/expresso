const express = require("express");
const sqlite3 = require("sqlite3");

const employeesRouter = express.Router();

const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

employeesRouter.get("/", (req, res, next) => {
  db.all(
    "SELECT * FROM Employee WHERE is_current_employee = 1",
    (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ employees: employees });
      }
    }
  );
});

employeesRouter.post("/", (req, res, next) => {
  const employee = req.body.employee;
  employee.isCurrentEmployee = employee.isCurrentEmployee || 1;

  if (employee && employee.name && employee.position && employee.wage) {
    db.run(
      `
        INSERT INTO Employee (name, position, wage, is_current_employee)
        VALUES ($name, $position, $wage, $is_current_employee)
      `,
      {
        $name: employee.name,
        $position: employee.position,
        $wage: employee.wage,
        $is_current_employee: employee.isCurrentEmployee,
      },
      function (error) {
        if (error) {
          next(error);
        } else {
          db.get(
            "SELECT * FROM Employee WHERE id = $id",
            { $id: this.lastID },
            (error, employee) => {
              if (error) {
                next(error);
              }
              res.status(201).send({ employee: employee });
            }
          );
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

employeesRouter.param("employeeId", (req, res, next, employeeId) => {
  db.get(
    "SELECT * FROM Employee WHERE Employee.id = $employeeId",
    { $employeeId: employeeId },
    (error, employee) => {
      if (error) {
        next(error);
      } else if (employee) {
        req.employee = employee;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  );
});

employeesRouter.get("/:employeeId", (req, res) => {
  res.status(200).json({ employee: req.employee });
});

employeesRouter.put("/:employeeId", (req, res, next) => {
  const employee = req.body.employee;
  const employeeId = req.employee.id;
  employee.isCurrentEmployee = employee.isCurrentEmployee || 1;

  if (employee && employee.name && employee.position && employee.wage) {
    db.run(
      `
        UPDATE Employee 
        SET name = $name, 
          position = $position, 
          wage = $wage, 
          is_current_employee = $is_current_employee
        WHERE id = $id
      `,
      {
        $id: employeeId,
        $name: employee.name,
        $position: employee.position,
        $wage: employee.wage,
        $is_current_employee: employee.isCurrentEmployee,
      },
      (error) => {
        if (error) {
          next(error);
        } else {
          db.get(
            "SELECT * FROM Employee WHERE id = $id",
            { $id: employeeId },
            (error, employee) => {
              if (error) {
                next(error);
              }
              res.status(200).send({ employee: employee });
            }
          );
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

employeesRouter.delete("/:employeeId", (req, res, next) => {
  const employeeId = req.employee.id;

  if (employeeId) {
    db.run(
      `
        UPDATE Employee
        SET is_current_employee = 0
        WHERE id = $id
      `,
      {
        $id: employeeId,
      },
      (error) => {
        if (error) {
          next(error);
        } else {
          db.get(
            "SELECT * FROM Employee WHERE id = $id",
            { $id: employeeId },
            (error, employee) => {
              if (error) {
                next(error);
              }
              res.status(200).send({ employee: employee });
            }
          );
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

const timesheetsRouter = require("./timesheets");
employeesRouter.use("/:employeeId/timesheets", timesheetsRouter);

module.exports = employeesRouter;
