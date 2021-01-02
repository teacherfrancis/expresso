const express = require("express");
const sqlite3 = require("sqlite3");

const menuRouter = express.Router();

const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

menuRouter.get("/", (req, res, next) => {
  db.all("SELECT * FROM Menu", (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ menus: menus });
    }
  });
});

menuRouter.post("/", (req, res, next) => {
  const menu = req.body.menu;

  if (menu && menu.title) {
    db.run(
      `
        INSERT INTO Menu (title)
        VALUES ($title)
      `,
      {
        $title: menu.title,
      },
      function (error) {
        if (error) {
          next(error);
        } else {
          db.get(
            "SELECT * FROM Menu WHERE id = $id",
            { $id: this.lastID },
            (error, menu) => {
              if (error) {
                next(error);
              }
              res.status(201).send({ menu: menu });
            }
          );
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

menuRouter.param("menuId", (req, res, next, menuId) => {
  db.get(
    "SELECT * FROM Menu WHERE Menu.id = $menuId",
    { $menuId: menuId },
    (error, menu) => {
      if (error) {
        next(error);
      } else if (menu) {
        req.menu = menu;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  );
});

menuRouter.get("/:menuId", (req, res) => {
  res.status(200).json({ menu: req.menu });
});

menuRouter.put("/:menuId", (req, res, next) => {
  const menu = req.body.menu;
  const menuId = req.menu.id;

  if (menu && menu.title) {
    db.run(
      `
        UPDATE Menu
        SET title = $title
        WHERE id = $id
      `,
      {
        $id: menuId,
        $title: menu.title,
      },
      (error) => {
        if (error) {
          next(error);
        } else {
          db.get(
            "SELECT * FROM Menu WHERE id = $id",
            { $id: menuId },
            (error, menu) => {
              if (error) {
                next(error);
              }
              res.status(200).send({ menu: menu });
            }
          );
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

menuRouter.delete("/:menuId", (req, res, next) => {
  const menuId = req.menu.id;

  if (menuId) {
    db.all(
      "SELECT * FROM MenuItem WHERE menu_id = $id",
      { $id: menuId },
      (error, menuItems) => {
        if (error) {
          next(error);
        }
        if (menuItems && menuItems.length) {
          res.sendStatus(400);
        } else {
          db.run(
            `
              DELETE FROM Menu
              WHERE id = $id
            `,
            {
              $id: menuId,
            },
            (error) => {
              if (error) {
                next(error);
              } else {
                res.sendStatus(204);
              }
            }
          );
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

const menuItemsRouter = require("./menuItems");
menuRouter.use("/:menuId/menu-items", menuItemsRouter);

module.exports = menuRouter;
