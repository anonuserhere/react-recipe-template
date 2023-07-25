const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const MongoClient = mongodb.MongoClient;
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

async function connect() {
  const mongo_url = process.env.MONGODB_URI;
  let client = await MongoClient.connect(mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  let db = client.db("fake_recipes");
  console.log("database connected");
  return db;
}

async function main() {
  let db = await connect();

  app.get("/recipes", async (req, res) => {
    try {
      let recipes = await db.collection("recipes").find().toArray();
      res.json(recipes);
    } catch (e) {
      console.log(e);
    }
  });

  app.get("/recipes/:recipeId", async (req, res) => {
    try {
      let r = await db.collection("recipes").findOne({
        _id: new ObjectId(req.params.recipeId),
      });
      res.json(r);
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ error: "An error occurred while fetching recipe" });
    }
  });

  app.post("/recipes", async (req, res) => {
    try {
      const { title, ingredients } = req.body;

      if (
        !Array.isArray(ingredients) ||
        !ingredients.every((ingredient) => typeof ingredient === "string")
      ) {
        return res.status(400).json({
          error: "ingredients must be an array of strings",
        });
      }

      let results = await db
        .collection("recipes")
        .insertOne({ title, ingredients });
      res.json(results);
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ error: "An error occurred while creating recipe" });
    }
  });

  app.put("/recipes/:id", async (req, res) => {
    try {
      const { title, ingredients } = req.body;
      if (
        !Array.isArray(ingredients) ||
        ingredients.every((ingredient) => typeof ingredient === "string")
      ) {
        return res.status(400).json({
          error: "ingredients must be an array of strings",
        });
      }
      let results = await db.collection("recipes").updateOne(
        {
          _id: new ObjectId(req.params.id),
        },
        {
          $set: {
            title: title,
            ingredients: ingredients,
          },
        }
      );
      res.json({
        status: true,
      });
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    }
  });
}

main();

const port = process.env.PORT || 3123;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on(["SIGINT", "SIGQUIT", "SIGKILL", "SIGTERM"], async () => {
  console.log("Closing server...");
  try {
    db.shutdownServer();
    await db.close();
    process.exit(0);
  } catch (e) {
    console.error("Error shutting down server:", e);
    process.exit(1);
  }
});
