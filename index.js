const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());


// password
// fahimCrud
// 5DMogBHrzOz6NFzJ


app.get('/', (req, res) => {
    res.send('Server is running')
})




const uri = "mongodb+srv://fahimCrud:5DMogBHrzOz6NFzJ@cluster0.rxkguw5.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const database = client.db("dataDB")
        const dataCollection = database.collection("data")
        
        
        app.post('/addData', async (req, res)=>{
            const data = req.body;
            // console.log(req.body)
            const result = await dataCollection.insertOne(data);
            res.send(result);
        })

        
        app.get('/addData', async(req, res) => {
            const page = parseInt(req.query.page) || 0;
            const limit = parseInt(req.query.limit) || 5;
            const skip = page * limit;
            const search = req.query.search;
            console.log(search)
            const query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { productModelNo: { $regex: search, $options: 'i' } },
                    { productProblem: { $regex: search, $options: 'i' } },
                    { productStatus: { $regex: search, $options: 'i' } }
                ]              
        }
            const result = await dataCollection.find(query).skip(skip).limit(limit).toArray()
            // const cursor = dataCollection.find()
            // const result = await cursor.toArray()
            res.send(result);
        })

        app.get('/addData/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await dataCollection.findOne(query)
            res.send(result);
        })

        app.delete('/addData/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await dataCollection.deleteOne(query)
            res.send(result);
        })

        app.put('/addData/:id', async(req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = {_id: new ObjectId(id)};
            const options = { upsert: true };
            const updatedData = {
                $set: {
                    name: data.name,
                    number: data.number,
                    address: data.address,
                    productSerialNo: data.productSerialNo,
                    productModelNo: data.productModelNo,
                    issueDate: data.issueDate,
                    tentativeDate: data.tentativeData,
                    productProblem: data.productProblem,
                    productStatus: data.productStatus
                },
              };
            const result = await dataCollection.updateOne(filter, updatedData, options)
            res.send(result);
        })

        app.get('/totalData', async (req, res ) => {
            const result = await dataCollection.estimatedDocumentCount();
            res.send({totalData: result})
        })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})

