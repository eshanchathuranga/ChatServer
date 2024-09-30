// Import MongoDb npm package
const { json } = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
// Initialize the Config File
require('dotenv').config();

// Write the connection function
 const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri, { useUnifiedTopology: true });

// Write the function to write data to the database
async function writeData(databaseName, collectionName, data) {
    const result = await client.db(databaseName).collection(collectionName).insertOne(data);
    // Debug Message
    console.log(`Debug Message : ${result.insertedId}`);
    return result;
}
// Write the function to read data from the database
async function readData(databaseName, collectionName, query) {
    const result = await client.db(databaseName).collection(collectionName).findOne(query);
    // Debug Message
    console.log(`Debug Message : ${result}`);
    return result;
}
// Write the function to read data using id
async function readDataById(databaseName, collectionName, id) {
    const result = await client.db(databaseName).collection(collectionName).findOne({ _id: id });
    // Debug Message
    console.log(`Debug Message : ${result}`);
    return result;
}
// Write the function to read all data from the database
async function readAllData(databaseName, collectionName) {
    const result = await client.db(databaseName).collection(collectionName).find({}).toArray();
    // Debug Message
    console.log(`Debug Message : ${result}`);
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
    // Debug Message
    console.log(`Debug Message : ${result}`);
    return result;
}
// Create a new collection
async function createCollection(databaseName, collectionName) {
    const result = await client.db(databaseName).createCollection(collectionName);
    // Debug Message
    console.log(`Debug Message : ${result}`);
    return result;
}
// Check if query in collection 
async function checkQueryInCollection(databaseName, collectionName, query) {
    const result = await client.db(databaseName).collection(collectionName).findOne(query);
    // Debug Message
    console.log(`Debug Message : ${result}`);
    return result;
}
// Add data to the query in collection
async function addDataToCollection(databaseName, collectionName, query, data) {
    const result = await client.db(databaseName).collection(collectionName).updateOne(query, { $set: data });
    // Debug Message
    console.log(`Debug Message : ${result}`);
    return result;
}
// Write the function get data using username
async function readDataByUsername(databaseName, collectionName, username) {
    const result = await client.db(databaseName).collection(collectionName).findOne({ username: username });
    // Debug Message
    console.log(`Debug Message : ${result}`);
    return result;
}
// Update the data
async function updateEmail(databaseName, collectionName, userId, data) {
    const result = await client.db(databaseName).collection(collectionName).updateOne({_id: userId}, { $set: {email: data} });
    // Debug Message
    console.log(`Debug Message : ${result}`);
    return result;
}

// Write the function to update query value using id
async function updateQuery(databaseName, collectionName, id, data, value) {
    const document = readDataById(databaseName, collectionName, id);
    document[data] = value;
    const result = await client.db(databaseName).collection(collectionName).updateOne({ _id: id }, { $set: document });
    // Debug Message
    console.log(`Debug Message : ${JSON.stringify(result)}`);
    return result;
}
// Write the function to update username using id





// Export the functions
module.exports = { writeData, 
    readData, 
    readAllData, 
    waitUpdate, 
    checkCollectionExists, 
    createCollection,
    readDataById, readDataByUsername,
    updateEmail,
    updateQuery, 

};
