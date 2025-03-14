const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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
    device: String
});

const UrlModel = mongoose.model("Url", urlSchema);

function shortenUrl(url) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let string = "";
    for (let i = 0; i < 8; i++) {
        string += chars[Math.floor(Math.random() * chars.length)];
    }
    return string;
}

app.post('/url', async (req, res) => {
    const { url, device } = req.body;
    const shortId = shortenUrl(url);
    const shortUrl = "http://localhost:8080/" + shortId;

    try {
        await UrlModel.create({ url, shortId, device });
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
        res.redirect(record.url);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error retrieving URL");
    }
});

app.listen(8080, () => console.log("Server running on port 8080"));
