require("dotenv").config();
const express = require("express");
const cors = require('cors')
const bodyParser = require('body-parser');
const bucketRouter = require("./routers/bucket.routers.js")
const pineconeRouter = require("./routers/pinecone.routers.js")
const queryRouter = require("./routers/query.routers.js")


const app = express();

const PORT = process.env.PORT || 5000;

// config
app.set('port', PORT);

app.use(cors())
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use("/api/v1/upload",bucketRouter)
app.use("/api/v1/pinecone",pineconeRouter)
app.use("/api/v1/query",queryRouter)


app.listen(PORT,()=>{
    console.log(`Server is starting on ${PORT}`)
})  