const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');
const jwt = require('jsonwebtoken');

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('Hello phone garage'))

// database

const uri = process.env.DB_URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        const brandCollection = client.db('phone_garage').collection('brands')
        app.get('/brands', async (req, res) => {
            const query = {}
            const result = await brandCollection.find(query).toArray()
            res.send(result)
        })
        app.post('/brands', async (req, res) => {
            const data = req.body
            const result = await brandCollection.insertOne(data)
            res.send(result)
        })
    } catch (error) {
        console.log(error)
    }
}
run().catch(er => console.log(er))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))