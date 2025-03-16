const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const CryptoJS = require('crypto-js')

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const mongoURI = "mongodb+srv://22510899dypit:7WD3F8eZrvlB1L3K@cluster0.6gkdx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Atlas Connected"))
    .catch(err => console.log(err));

const urlSchema = new mongoose.Schema({
    url: String,
    shortId: String,
    device: String,
    secret: String
});

const UrlModel = mongoose.model("Url", urlSchema);

function shortenUrl() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let string = "";
    for (let i = 0; i < 8; i++) {
        string += chars[Math.floor(Math.random() * chars.length)];
    }
    return string;
}

const decryptData = (url, secretKey) => {
    let encryptedBytes = atob(url).split("").map(char => char.charCodeAt(0));
    let decrypted = '';

    for (let i = 0; i < encryptedBytes.length; i++) {
        decrypted += String.fromCharCode(encryptedBytes[i] ^ secretKey.charCodeAt(i % secretKey.length));
    }

    return decrypted;
}

app.post('/url', async (req, res) => {
    const { url, device, secret } = req.body;
    const shortId = shortenUrl();
    const shortUrl = "https://urlshortener-lxro.onrender.com/" + shortId;

    try {
        await UrlModel.create({ url, shortId, device, secret });
        res.send(shortUrl);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Failed to shorten URL");
    }
});

app.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const record = await UrlModel.findOne({ shortId: id });
        if (!record) return res.status(404).send("Short URL not found");
        console.log(record);
        
        // const val = decryptData(record.url, record.secret)
        // console.log("hi");
        
        // console.log(val);
        res.redirect(record.url);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error retrieving URL");
    }
});
const PORT = process.env.PORT || 8080
app.listen(8080, () => console.log("Server running on port 8080"));
