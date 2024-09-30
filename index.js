// Import the package
const express = require('express');
const bodyParser = require('body-parser');

// Inport Modules
const { writeData, readData,  checkCollectionExists, updateEmail, createCollection, readDataByUsername ,readDataById } = require('./Module/Database');
const e = require('express');
const {generateOTP, sendEmail} = require('./Module/EmailSender');


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
// Create MongoDB connection
// const ConnectionUri = process.env.MONGO_URI;
// const db = connectdb(ConnectionUri);

// Start the server
async function StartServer(){
    const app = express();
    app.use(bodyParser.json());


try {
    // Authentication 
    app.post('/auth', async (req, res) => {
        let type = req.body.type;
        let data = {
            password: req.body.password,
            email: req.body.email,
        }
        // Create an account
        if (type == 'signup') {
            let dataInsert = {
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
            }
            let result = await writeData('auth', "users", dataInsert);
            if (result == null) {
                console.log(color.red, `Account creation failed`);
                let response = {
                    "status": "error",
                    "code": false,
                    "message": "Account creation failed",
                }
                res.send(response);
            } else {
               let userData = await readDataById('auth', "users", result.insertedId);
               console.log(JSON.stringify(userData));
                let response = {
                    "status": "success",
                    "code": true,
                    "message": "Account created successfully",
                    "userData": userData,
                }
                res.send(response);
                console.log(color.green, `Account created successfully ID : ${result.insertedId}`);
            }
        }
        // Login to account
        if (type == 'login') {
            console.log(color.yellow, `Incoming request for login : ${data.email}`);
            let result = await readData('auth', "users", data);
            if (result == null) {
                console.log(color.red, `Invalid username or password`);
                let response = {
                    "status": "error",
                    "code": false,
                    "message": "Invalid username or password",
                }
                res.send(response);
            } else {
                let response = {
                    "status": "success",
                    "code": true,
                    "message": "Login success",
                    "userData": result,
                }
                res.send(response);
                console.log(color.green, `Login success ID : ${result._id}`);
            }
        }
        // Check if account already exists
        if (type == 'check') {
            console.log(color.yellow, `Incoming request for check : ${data.email}`);
            let result = await readData('auth', "users", data);
            if (result == null) {
                console.log(color.green, `Account does not exist`);
                let response = {
                    "status": "success",
                    "code": true,
                    "message": "Account does not exist",
                }
                res.send(response);
            } else {
                let response = {
                    "status": "error",
                    "code": false,
                    "message": "Account already exists",
                }
                res.send(response);
                console.log(color.red, `Account already exists ID : ${result._id}`);
            }
        }     
    });
    // Conversations
    app.post('/send', async (req, res) => {
        console.log(req.query);
        let fromId = req.query.fromId;
        let toId = req.query.toId;
        let data = {
            "senderId": fromId,
            "message": req.body.message,
            "time": req.body.time,
            "date": req.body.date,
        }
        console.log(color.yellow, `Incoming request for conversations : ${fromId} to ${toId}`);
        let result = await getConversation(fromId, toId);
        if (result == null) {
            await createCollection('conversations', `${fromId}_${toId}`);
            await writeData('conversations', `${fromId}_${toId}`, data);
            let response = {
                "status": "success",
                "code": true,
                "message": "Conversation created successfully",
                "conversationId": `${fromId}_${toId}`,
                "data": data,
            }
            await res.send(response);
            console.log(color.green, `Conversation created successfully NAME : ${fromId}_${toId}`);
            console.log(color.green, `Message sent successfully ID : ${toId}`);
        }
        else {
            await writeData('conversations', result, data);
            let response = {
                "status": "success",
                "code": true,
                "message": "Message sent successfully",
                "conversationId": `${fromId}_${toId}`,
                "data": data,
            }
            await res.send(response);
            console.log(color.green, `Message sent successfully ID : ${toId}`);
        }
  
    });
    // Search User
    app.post('/search', async (req, res) => {
        let query = req.query;
        console.log(color.yellow, `Incoming request for search : ${query.searchUserName}`);
        let result = await readDataByUsername('auth', "users", query.searchUserName);
        if (result == null) {
            console.log(color.red, `User not found`);
            let response = {
                "status": "error",
                "code": false,
                "message": "User not found",
            }
            res.send(response);
        } else {
            let response = {
                "status": "success",
                "code": true,
                "message": "User found",
                "userData": result,
            }
            res.send(response);
            console.log(color.green, `User found ID : ${result._id}`);
        }
    });
    app.post('/get', async (req, res) => {
        let queryData = req.query;
        let data = req.body;
        console.log(color.yellow, `Incoming request for get users : ${req.query.userId}`);
        let result = await readDataByUsername('auth', "users", req.query.userId);
        if (result == null) {
            console.log(color.red, `User not found`);
            let response = {
                "status": "error",
                "code": false,
                "message": "User not found",
            }
            res.send(response);
        } else {
            let response = {
                "status": "success",
                "code": true,
                "message": "User found",
                "userData": result,
            }
            res.send(response);
            console.log(color.green, `User found ID : ${result._id}`);
        }

    });
    // Update User
    app.post('/update', async (req, res) => {
        let _id = req.query.authId;
        let data = req.body;
        let path = req.query.path;
        if (path == 'email') {
            console.log(color.yellow, `Incoming request for update email : ${_id}`);
            let result = await updateEmail('auth', "users", _id, data.email);
            console.log(JSON.stringify(result));
            if (result == null) {
                console.log(color.red, `Email not updated`);
                let response = {
                    "status": "error",
                    "code": false,
                    "message": "Email not updated",
                }
                res.send(response);
            } else {
                let response = {
                    "status": "success",
                    "code": true,
                    "message": "Email updated successfully",
                }
                res.send(response);
                console.log(color.green, `Email updated successfully ID : ${_id}`);
            }
        }
    });
    // Send OTP
    app.post('/sendotp', async (req, res) => {
        let id = req.query.authId;
        let email = req.body.email;
        let username = req.body.username;
        let otp = await generateOTP();
        console.log(otp)
        await sendEmail(email, id, username, otp).then((result) => {
        if (result) {
            console.log(color.red, `Email not sent`);
            let response = {
                "status": "error",
                "code": false,
                "message": "Email not sent",
            }
            res.send(response);
        } else {
            let response = {
                "status": "success",
                "code": true,
                "message": "Email sent successfully",
                "otp": otp,
            }
            res.send(response);
            console.log(color.green, `Email sent to : ${id}`);
        }
     });

    });

    

} catch (error) {
    console.log(error);
}

    app.listen(3000, () => {
        console.log(color.green, 'Server started on port 3000');
    });
}
// Start the server
StartServer();


async function getConversation(fromId, toId) {
    let collectionOne = `${fromId}_${toId}`;
    let collectionTwo = `${toId}_${fromId}`;
    let result = await readData('conversations', collectionOne);
    if (result != null) {
        return collectionOne;
    }
    else {
        let result = await readData('conversations', collectionTwo);
        if (result!= null) {
            return collectionTwo;
        }
        else {
            return null;
        }
    }
}