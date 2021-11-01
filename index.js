const express = require('express');
const {MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
// const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxa3e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function run() {
    try {
        await client.connect();
        const database = client.db('courierServices');
        const servicesCollection = database.collection('services');
        // Get API
        app.get('/services', async(req,res)=>{
            
          const cursor = servicesCollection.find({});
          
          const page = req.query.page;
          
          const size = parseInt(req.query.size);
          
          let services;
          const count = await cursor.count();
          if(page){
            services = await cursor.skip(page*size).limit(size).toArray();
          }else{
            services = await cursor.toArray();
          };
        //   const services = await cursor.toArray();
          res.send({
              count,
            services
          });
        });

        // GET singel service
        app.get('/services/:id', async (req, res) => {
          
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        });



        // Post API
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);
            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.json(result);
        });
        // DELETE API
        app.delete('/services/:id', async(req,res) =>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            console.log(query);
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('runniing my curd server')
});
app.listen(port, () => {
    console.log('running server on port', port);
})