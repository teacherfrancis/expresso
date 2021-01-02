const express = require("express");
const sqlite3 = require("sqlite3");

const menuItemsRouter = express.Router();

const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

menuItemsRouter.get("/", (req, res, next) => {
  const menuId = req.menu.id;

  db.all(
    "SELECT * FROM MenuItem WHERE menu_id = $menu_id",
    {
      $menu_id: menuId,
    },
    (err, menuItems) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ menuItems: menuItems });
      }
    }
  );
});

menuItemsRouter.post("/", (req, res, next) => {
  const menuItem = req.body.menuItem;
  const menuId = req.menu.id;

  if (
    menuItem &&
    menuItem.name &&
    menuItem.description &&
    menuItem.inventory &&
    menuItem.price
  ) {
    db.run(
      `
        INSERT INTO MenuItem (name, description, inventory, price, menu_id)
        VALUES ($name, $description, $inventory, $price, $menu_id)
      `,
      {
        $name: menuItem.name,
        $description: menuItem.description,
        $inventory: menuItem.inventory,
        $price: menuItem.price,
        $menu_id: menuId,
      },
      function (error) {
        if (error) {
          next(error);
        } else {
          db.get(
            "SELECT * FROM MenuItem WHERE id = $id",
            { $id: this.lastID },
            (error, menuItem) => {
              if (error) {
                next(error);
              }
              res.status(201).send({ menuItem: menuItem });
            }
          );
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

menuItemsRouter.param("menuItemId", (req, res, next, menuItemId) => {
  db.get(
    "SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId",
    { $menuItemId: menuItemId },
    (error, menuItem) => {
      if (error) {
        next(error);
      } else if (menuItem) {
        req.menuItem = menuItem;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  );
});

menuItemsRouter.put("/:menuItemId", (req, res, next) => {
  const menuItem = req.body.menuItem;
  const menuItemId = req.menuItem.id;
  const menuId = req.menu.id;

  if (
    menuItem &&
    menuItem.name &&
    menuItem.description &&
    menuItem.inventory &&
    menuItem.price
  ) {
    db.run(
      `
        UPDATE MenuItem
        SET name = $name,
          description = $description,
          inventory = $inventory,
          price = $price,
          menu_id = $menu_id
        WHERE id = $id
      `,
      {
        $id: menuItemId,
        $name: menuItem.name,
        $description: menuItem.description,
        $inventory: menuItem.inventory,
        $price: menuItem.price,
        $menu_id: menuId,
      },
      (error) => {
        if (error) {
          next(error);
        } else {
          db.get(
            "SELECT * FROM MenuItem WHERE id = $id",
            { $id: menuItemId },
            (error, menuItem) => {
              if (error) {
                next(error);
              }
              res.status(200).send({ menuItem: menuItem });
            }
          );
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

menuItemsRouter.delete("/:menuItemId", (req, res, next) => {
  const menuItemId = req.menuItem.id;

  if (menuItemId) {
    db.run(
      `
        DELETE FROM MenuItem
        WHERE id = $id
      `,
      {
        $id: menuItemId,
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

module.exports = menuItemsRouter;
