const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Server is running')
})


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.zpoxnhb.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp`;


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
        await client.connect();

        const database = client.db("dataDB")
        const dataCollection = database.collection("data")


        app.post('/addData', async (req, res) => {
            const data = req.body;
            // console.log(req.body)
            const result = await dataCollection.insertOne(data);
            res.send(result);
        })

        app.get('/addData', async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 0;
                const limit = parseInt(req.query.limit) || 10;
                const skip = page * limit;
                const search = req.query.search;
                const searchTerms = search.split(' ');
                
                const query = {
                    $and: []
                };
        
                // Loop through search terms and add conditions for each field
                searchTerms.forEach(term => {
                    query.$and.push(
                        {
                            $or: [
                                { name: { $regex: term, $options: 'i' } },
                                { productModelNo: { $regex: term, $options: 'i' } },
                                { productProblem: { $regex: term, $options: 'i' } },
                                { productStatus: { $regex: term, $options: 'i' } }
                            ]
                        }
                    );
                });
        
                const result = await dataCollection.find(query).skip(skip).limit(limit).toArray();
                res.send(result);
            } catch (error) {
                console.error('Fetch error:', error);
                // Handle the error
            }
        });
        


        app.get('/addData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await dataCollection.findOne(query)
            res.send(result);
        })

        app.delete('/addData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await dataCollection.deleteOne(query)
            res.send(result);
        })

        app.put('/addData/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedData = {
                $set: {
                    name: data.name,
                    number: data.number,
                    address: data.address,
                    productSerialNo: data.productSerialNo,
                    productModelNo: data.productModelNo,
                    issueDate: data.issueDate,
                    tentativeDate: data.tentativeDate,
                    productProblem: data.productProblem,
                    productStatus: data.productStatus
                },
            };
            const result = await dataCollection.updateOne(filter, updatedData, options)
            res.send(result);
        })

        app.get('/totalData', async (req, res) => {
            const result = await dataCollection.estimatedDocumentCount();
            res.send({ totalData: result })
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

