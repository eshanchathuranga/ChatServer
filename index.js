// Import the package
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Inport Modules
const { writeData, readData, updateUsername,updatePicUrl, removeDocument, updatePassword, updateEmail, createCollection, readDataByUsername ,readDataById } = require('./Module/Database');
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
    console.log(color.green, "Server Status : Online");


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
                picUrl: "https://i.ibb.co/Sd6SBMv/Test01.jpg"
            }
            console.log(color.yellow, `Incoming request for signup : ${data.email}`);
            let result = await writeData('auth', "users", dataInsert);
            if (result == null) {
                let response = {
                    "status": "error",
                    "code": false,
                    "message": "Account creation failed",
                }
                res.send(response);
                console.log(color.red, `Account creation failed`);
            } else {
               let userData = await readDataById('auth', "users", result.insertedId);
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
                let response = {
                    "status": "error",
                    "code": false,
                    "message": "Invalid username or password",
                }
                res.send(response);
                console.log(color.red, `Invalid username or password`);
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
            console.log(color.yellow, `Incoming request for check account : ${data.email}`);
            let result = await readData('auth', "users", data);
            if (result == null) {
                let response = {
                    "status": "success",
                    "code": true,
                    "message": "Account does not exist",
                }
                res.send(response);
                console.log(color.green, `Account does not exist`);
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
        let updateId = req.query.authId;
        let updateOption = req.query.option;
        let updateData = req.body.data;
        console.log(color.yellow, `Incoming request for update ${updateOption} : ${updateId}`);
        if (updateOption == 'email') {
            let result = await updateEmail('auth', "users", updateId, updateData);
            if (result == null) {
                console.log(color.red, `Email update failed`);
                let response = {
                    "status": "error",
                    "code": false,
                    "message": "Email update failed",
                }
                res.send(response);
            }
            else {
                let response = {
                    "status": "success",
                    "code": true,
                    "message": "Email updated successfully",
                }
                res.send(response);
                console.log(color.green, `Email updated successfully ID : ${updateId}`);
            }
        }
        if (updateOption == 'username') {
            let result = await updateUsername('auth', "users", updateId, updateData);
            if (result == null) {
                console.log(color.red, `Username update failed`);
                let response = {
                    "status": "error",
                    "code": false,
                    "message": "Username update failed",
                }
                res.send(response);
            }
            else {
                let response = {
                    "status": "success",
                    "code": true,
                    "message": "Username updated successfully",
                }
                res.send(response);
                console.log(color.green, `Username updated successfully ID : ${updateId}`);
            }   
        }
        if (updateOption == 'password') {
            let result = await updatePassword('auth', "users", updateId, updateData);
            if (result == null) {
                console.log(color.red, `Password update failed`);
                let response = {
                    "status": "error",
                    "code": false,
                    "message": "Password update failed",
                }
                res.send(response);
            }
            else {
                let response = {
                    "status": "success",
                    "code": true,
                    "message": "Password updated successfully",
                }
                res.send(response);
                console.log(color.green, `Password updated successfully ID : ${updateId}`);
            }
        } 
        if (updateOption == 'picUrl') {
            let result = await updatePicUrl('auth', "users", updateId, updateData);
            if (result == null) {
                console.log(color.red, `PicUrl update failed`);
                let response = {
                    "status": "error",
                    "code": false,
                    "message": "PicUrl update failed",
                }
                res.send(response);
            }
            else {
                let response = {
                    "status": "success",
                    "code": true,
                    "message": "PicUrl updated successfully",
                }
                res.send(response);
                console.log(color.green, `PicUrl updated successfully ID : ${updateId}`);
            }
        }  
    });
    // Delete User
    app.post('/delete', async (req, res) => {
        let deleteId = req.query.authId;
        console.log(color.yellow, `Incoming request for delete : ${deleteId}`);
        let result = await removeDocument('auth', "users", deleteId);
        if (result == null) {
            console.log(color.red, `Delete failed`);
            let response = {
                "status": "error",
                "code": false,
                "message": "Delete failed",
            }
            res.send(response);
        }
        else {
            let response = {
                "status": "success",
                "code": true,
                "message": "Delete success",
            }
            res.send(response);
            console.log(color.green, `Delete success ID : ${deleteId}`);
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

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "client", "build")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "client", "build", "index.html"));
    });
}

 const port = process.env.PORT || 3000;
    app.listen(port, () => {
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