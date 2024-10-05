// Import MongoDb npm package
const { json } = require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// Initialize the Config File
require('dotenv').config();
// Define colors
// Define the colors
const color = {
    red: '\x1b[31m%s\x1b[0m',
    green: '\x1b[32m%s\x1b[0m',
    yellow: '\x1b[33m%s\x1b[0m',
    blue: '\x1b[34m%s\x1b[0m',
    magenta: '\x1b[35m%s\x1b[0m',
    cyan: '\x1b[36m%s\x1b[0m',
    white: '\x1b[37m%s\x1b[0m'
}
// Write the connection function
 const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log(color.green, "Database connection status : Online")

// Write the function to write data to the database
async function writeData(databaseName, collectionName, data) {
    const result = await client.db(databaseName).collection(collectionName).insertOne(data);
    return result;
}
// Write the function to read data from the database
async function readData(databaseName, collectionName, query) {
    const result = await client.db(databaseName).collection(collectionName).findOne(query);
    return result;
}
// Write the function to read data using id
async function readDataById(databaseName, collectionName, id) {
    const result = await client.db(databaseName).collection(collectionName).findOne({ _id: id });
    return result;
}
// Write the function to read all data from the database
async function readAllData(databaseName, collectionName) {
    const result = await client.db(databaseName).collection(collectionName).find({}).toArray();
    return result;
}
// Write the function to wait for an update
async function waitUpdate(client, databaseName, collectionName, callback) {
    const changeStream = client.db(databaseName).collection(collectionName).watch();
    changeStream.on('change', async (change) => {
        callback(true, change);
    });
}
// Check if the collection is exists
async function checkCollectionExists(databaseName, collectionName) {
    const result = await client.db(databaseName).listCollections({ name: collectionName }).toArray();
    return result;
}
// Create a new collection
async function createCollection(databaseName, collectionName) {
    const result = await client.db(databaseName).createCollection(collectionName);
    return result;
}
// Check if query in collection 
async function checkQueryInCollection(databaseName, collectionName, query) {
    const result = await client.db(databaseName).collection(collectionName).findOne(query);
    return result;
}
// Add data to the query in collection
async function addDataToCollection(databaseName, collectionName, query, data) {
    const result = await client.db(databaseName).collection(collectionName).updateOne(query, { $set: data });
    return result;
}
// Write the function get data using username
async function readDataByUsername(databaseName, collectionName, username) {
    const result = await client.db(databaseName).collection(collectionName).findOne({ username: username });
    return result;
}

// replace email value using id
async function updateEmail(databaseName, collectionName, idFilter, emailUpdate) {
    const database = await client.db(databaseName)
    const collection = database.collection(collectionName)
    const id = new ObjectId(idFilter);
    const filter = { _id: id };
    const updateDocument = {
           $set: {
              email: emailUpdate,
           },
        };
    const result = collection.updateOne(filter, updateDocument);
    return result;
}
// replace password value using id
async function updatePassword(databaseName, collectionName, idFilter, emailUpdate) {
    const database = await client.db(databaseName)
    const collection = database.collection(collectionName)
    const id = new ObjectId(idFilter);
    const filter = { _id: id };
    const updateDocument = {
           $set: {
              password: emailUpdate,
           },
        };
    const result = collection.updateOne(filter, updateDocument);
    return result;
}
// replace username value using id
async function updateUsername(databaseName, collectionName, idFilter, emailUpdate) {
    const database = await client.db(databaseName)
    const collection = database.collection(collectionName)
    const id = new ObjectId(idFilter);
    const filter = { _id: id };
    const updateDocument = {
           $set: {
              username: emailUpdate,
           },
        };
    const result = collection.updateOne(filter, updateDocument);
    return result;
}
// replace url value using id
async function updatePicUrl(databaseName, collectionName, idFilter, emailUpdate) {
    const database = await client.db(databaseName)
    const collection = database.collection(collectionName)
    const id = new ObjectId(idFilter);
    const filter = { _id: id };
    const updateDocument = {
           $set: {
              picUrl: emailUpdate,
           },
        };
    const result = collection.updateOne(filter, updateDocument);
    return result;
}
// remove document using id
async function removeDocument(databaseName, collectionName, idFilter) {
    const database = await client.db(databaseName)
    const collection = database.collection(collectionName)
    const id = new ObjectId(idFilter);
    const filter = { _id: id };
    const result = collection.deleteOne(filter);
    return result;
}





// Export the functions
module.exports = { 
    writeData, 
    readData, 
    readAllData, 
    waitUpdate, 
    checkCollectionExists, 
    createCollection,
    readDataById, readDataByUsername,
    updateEmail,
    updatePassword,
    updateUsername,
    updatePicUrl,
    removeDocument
};
