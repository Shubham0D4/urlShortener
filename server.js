const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const CryptoJS = require('crypto-js');

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
    shortId: String, // Use `shortId` instead of `shortenId`
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

const decryptData = (url, secret) => {
    try {
        const bytes = CryptoJS.AES.decrypt(url, secret);
        const decryptedUrl = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedUrl) throw new Error("Decryption failed");
        return decryptedUrl;
    } catch (error) {
        console.error("Decryption Error:", error);
        return null;
    }
};

app.post('/url', async (req, res) => {
    const { url, device, secret } = req.body;
    const shortId = shortenUrl();
    const shortUrl = `https://urlshortener-lxro.onrender.com/${shortId}`;

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

        const originalUrl = decryptData(record.url, record.secret);
        if (!originalUrl) return res.status(400).send("Invalid or incorrect secret key");

        res.redirect(originalUrl);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error retrieving URL");
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
