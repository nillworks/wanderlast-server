require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

app.use(express.json());
app.use(cors());

const jwks = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);

const client = new MongoClient(process.env.DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// auth
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];

  if (!authHeader) {
    return res.status(401).json({ message: 'unauthorized' });
  }
  if (!token) {
    return res.status(401).json({ message: 'unauthorized' });
  }

  // verify token
  try {
    const { payload } = await jwtVerify(token, jwks);
    next();
  } catch (error) {
    return res.status(403).json({ massage: 'forbidden' });
  }
};

async function run() {
  try {
    // await client.connect();
    // await client.db('admin').command({ ping: 1 });

    const database = client.db('Wanderlust');
    const DestinationsDataCollection = database.collection('data');
    const bookingCollection = database.collection('bookingData');

    // Get Data
    app.get('/featured', async (req, res) => {
      const cursor = DestinationsDataCollection.find();
      const data = await cursor.toArray();

      res.send({
        massage: 'successfully data get',
        ok: true,
        allWanderlustData: data,
      });
    });

    // Data Post
    app.post('/featured', verifyToken, async (req, res) => {
      const newFeaturedData = req.body;
      const result =
        await DestinationsDataCollection.insertOne(newFeaturedData);
      res.send(result);
    });

    // Details Data
    app.get('/featured/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };

      const detailsSend = await DestinationsDataCollection.findOne(query);
      res.send(detailsSend);
    });

    // Patch
    app.patch('/featured/:id', async (req, res) => {
      const id = req.params.id;
      const filterId = {
        _id: new ObjectId(id),
      };

      const updateFeatured = req.body;
      const updateDocument = {
        $set: {
          destinationName: updateFeatured.destinationName,
          country: updateFeatured.country,
          category: updateFeatured.category,
          price: updateFeatured.price,
          duration: updateFeatured.duration,
          departureDate: updateFeatured.departureDate,
          imageUrl: updateFeatured.imageUrl,
          description: updateFeatured.description,
        },
      };

      const result = await DestinationsDataCollection.updateOne(
        filterId,
        updateDocument,
      );
      res.send(result);
    });

    // Delete
    app.delete('/featured/:id', async (req, res) => {
      const id = req.params.id;
      const deleteOne = await DestinationsDataCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(deleteOne);
    });

    // Booking Information Data DB
    app.get('/booking', verifyToken, async (req, res) => {
      const cursor = bookingCollection.find();
      const result = await cursor.toArray();
      res.send({
        massage: 'successfully Booking Data get',
        ok: true,
        allBookingData: result,
      });
    });

    app.post('/booking', verifyToken, async (req, res) => {
      const newBooking = req.body;
      const result = await bookingCollection.insertOne(newBooking);
      res.send(result);
    });

    app.delete('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const deleteBooking = await bookingCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(deleteBooking);
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
