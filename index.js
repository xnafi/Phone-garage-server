const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // brands name
        const brandCollection = client.db('phone_garage').collection('brands')
        // users collection
        const usersCollection = client.db('phone_garage').collection('users')
        // Posted Items
        const postCollection = client.db('phone_garage').collection('postItems')

        // brand catagory
        app.get('/brands', async (req, res) => {
            const query = {}
            const result = await brandCollection.find(query).toArray()
            res.send(result)
        })
        // get catagory by id
        app.get('/brand/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await brandCollection.findOne(query)
            res.send(result)
        })
        // get add a user
        app.post('/users', async (req, res) => {
            const user = req.body

            const result = await usersCollection.insertOne(user)
            res.send(result)
        })
        // get users
        app.get('/users', async (req, res) => {
            const query = {}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        // get user by email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })
        // filter out sellers
        app.get('/users/sellers', async (req, res) => {
            const query = { role: "seller" }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        // delete a seller
        app.delete('/users/sellers/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })
        // filter out buyers
        app.get('/users/buyers', async (req, res) => {
            const query = { role: "buyer" }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        // delete a buyer
        app.delete('/users/buyers/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })
        app.post('/items', async (req, res) => {
            const item = req.body
            const result = await postCollection.insertOne(item)
            res.send(result)

        })
    } catch (error) {
        console.log(error)
    }
}
run().catch(er => console.log(er))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))