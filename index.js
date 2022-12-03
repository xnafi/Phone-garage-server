const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_KEY);


app.use(cors())

app.use(express.json())

app.get('/', (req, res) => res.send('Hello phone garage'))


function varifyToken(req, res, next) {
    const auth = req.headers.authorization
    if (!auth) {
        return res.status(401).send('unauthorize user access')
    }
    const token = auth.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            console.log(err);
            return res.status(403).send('forbidden access')

        }
        req.decoded = decoded;
        next()
    })


}

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
        // Booking
        const bookingCollection = client.db('phone_garage').collection('myBooking')



        // jwt token
        app.get('/jwt', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const exits = await usersCollection.findOne(query)
            if (exits) {
                const token = jwt.sign({ email }, process.env.JWT_KEY, { expiresIn: '1d' })
                return res.send({ accessToken: token })
            }
            res.status(403).send('forbidden access')

        })

        // payment
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.productPrice;
            const amount = parseInt(price) * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });
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
        app.get('/users', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }

            }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/users/sellers', async (req, res) => {
            const query = { role: "seller" }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        app.put('/users/sellers/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    isAdmin: true
                }
            }
            const result = await usersCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })
        app.get('/users/sellers/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })
        app.get('/users/sellers/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })
        app.post('/users/sellers/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    verify: true
                }
            }
            const result = await usersCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })
        app.delete('/users/sellers/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })
        app.get('/users/buyers', async (req, res) => {
            const query = { role: "buyer" }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/users/buyers/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })
        app.delete('/users/buyers/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })
        // items
        app.post('/items', async (req, res) => {
            const item = req.body
            const result = await postCollection.insertOne(item)
            res.send(result)
        })

        app.get('/items', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email,
                }
            } else if (req.query.name) {
                query = {
                    name: req.query.name
                }
            }
            if (req.query.isSold) {
                query = {
                    isSold: req.query.isSold
                }
            }

            const result = await postCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/advertise/item', async (req, res) => {
            const query = { advertise: true }
            const result = await postCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/items/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await postCollection.findOne(query)
            res.send(result)
        })

        app.post('/items/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    advertise: true
                }
            }
            const result = await postCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })


        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await postCollection.deleteOne(query)
            res.send(result)
        })

        // item report to admin

        app.get('/items/report', async (req, res) => {
            const query = { report: true }
            const result = await postCollection.find(query).toArray()
            res.send(result)
        })
        app.put('/items/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    report: true
                }
            }
            const result = await postCollection.updateOne(query, updateDoc)
            res.send(result)
        })


        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await postCollection.deleteOne(query)
            res.send(result)
        })

        // booking item save 

        app.post('/booking', async (req, res) => {
            const newBooking = req.body
            const result = await bookingCollection.insertOne(newBooking)
            res.send(result)
        })

        app.get('/booking', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    bookingUserEmail: req.query.email
                }
            }
            const result = await bookingCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await bookingCollection.findOne(query)
            res.send(result)
        })
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await bookingCollection.deleteOne(query)
            res.send(result)
        })
        app.post('/booking/:id', async (req, res) => {
            const booked = req.body

            const query = { _id: ObjectId(booked.id) }
            // const options = { upsert: true}
            const updateDoc = {
                $set: {
                    isSold: 'sold',
                    transationId: booked.transationId

                }
            }

            const result = await bookingCollection.updateOne(query, updateDoc)
            console.log(booked.productId);
            const quer = { _id: ObjectId(booked.productId) }
            const updateDo = {
                $set: {
                    isSold: "sold"
                }
            }
            const rest = await postCollection.updateOne(quer, updateDo)
            res.send(result)
        })




    } catch (error) {
        console.log(error)
    }
}
run().catch(er => console.log(er))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))