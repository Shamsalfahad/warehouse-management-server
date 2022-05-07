const ObjectId = require("mongodb").ObjectId;
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { listen } = require("express/lib/application");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1cytt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.1cytt.mongodb.net:27017,cluster0-shard-00-01.1cytt.mongodb.net:27017,cluster0-shard-00-02.1cytt.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-embpbb-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    console.log("data done")
    const itemsCollection = client.db("perfume_Gallery").collection("products");

    //  Jwt
     app.post("/login", (req, res) => {
       const email = req.body;
       console.log(email);
       const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
       console.log(token);
       res.send({ token });
     });

    app.get("/items", async (req, res) => {
      const query = {};
      const cursor = itemsCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
       const items = await itemsCollection.findOne(query);
       
       console.log('====================================');
       console.log(items);
       console.log('====================================');

      
      res.send(items);
    });

    //Delete a Product
    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });

    //insert items
    app.post("/items", async (req, res) => {
      const newItems = req.body;
      // const tokenInfo = req.headers.authorization;
      // console.log(tokenInfo);
      console.log("adding new items", newItems);
      const result = await itemsCollection.insertOne(newItems);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running my node Server");
});

app.listen(port, () => {
  console.log("server is running");
});
