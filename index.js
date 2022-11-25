const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { update } = require('tar');

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('Hello phone garage'))

// database

const uri = process.env.DB_URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        // brands name
        const brandCollection = client.db('phone_garage').collection('brands')
        // users collection
        const usersCollection = client.db('phone_garage').collection('users')


        app.get('/brands', async (req, res) => {
            const query = {}
            const result = await brandCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/brand/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await brandCollection.findOne(query)
            res.send(result)
        })
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })
        // app.post('/brands', async (req, res) => {
        //     const data = req.body
        //     const result = await brandCollection.insertOne(data)
        //     res.send(result)
        // })
    } catch (error) {
        console.log(error)
    }
}
run().catch(er => console.log(er))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))