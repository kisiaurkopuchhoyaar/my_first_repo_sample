//create a database connection to mongodb
//db.js

const { MongoClient, ServerApiVersion } = require("mongodb");
//importing env file
const uri =
  "mongodb+srv://gauravkumarbin0988:gauravData0988@myatlasclusteredu.9xk2yrs.mongodb.net/?retryWrites=true&w=majority&appName=myAtlasClusterEDU";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let db;

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    db = client.db("gaurav_project1");

    // Send a ping to confirm a successful connection
    await client.db("sample_mflix").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (e) {
    console.error(e);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
function getDb() {
  return db;
}
module.exports = {
  getDb,
};
