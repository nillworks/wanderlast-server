require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });

    const database = client.db('Wanderlust');
    const userCollection = database.collection('data');

    // Get Data
    app.get('/featured', async (req, res) => {
      const cursor = userCollection.find();
      const data = await cursor.toArray();

      res.send({
        massage: 'successfully data get',
        ok: true,
        allWanderlustData: data,
      });
    });

    // Data Post
    app.post('/featured', async (req, res) => {
      const newFeaturedData = req.body;
      const result = await userCollection.insertOne(newFeaturedData);
      res.send(result);
    });

    // Details Data
    app.get('/featured/:id', async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };

      const detailsSend = await userCollection.findOne(query);
      res.send(detailsSend);
    });

    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!',
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
