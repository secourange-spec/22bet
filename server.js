const express = require("express");
const axios = require("axios");
const cors = require("cors");
const zlib = require("zlib");

const app = express();

app.use(cors({ origin: "*", methods: ["GET"] }));

const axiosInstance = axios.create({
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://22bet.com/",
    "Origin": "https://22bet.com"
  },
  timeout: 10000
});

app.get("/", (req, res) => {
  res.send("Backend OK");
});

app.get("/odds", async (req, res) => {
  try {
    const response = await axiosInstance({
      url: "https://22bet.com/LiveFeed/Get1x2_VZip?sports=85&count=50&lng=en&mode=4&cyberFlag=1",
      responseType: "arraybuffer"
    });

    const encoding = response.headers["content-encoding"];
    let data;

    if (encoding === "gzip") {
      data = zlib.gunzipSync(response.data);
    } else if (encoding === "deflate") {
      data = zlib.inflateSync(response.data);
    } else if (encoding === "br") {
      data = zlib.brotliDecompressSync(response.data);
    } else {
      data = response.data;
    }

    let parsed;

    try {
      parsed = JSON.parse(data.toString());
    } catch (e) {
      return res.status(500).json({
        error: "Réponse non JSON (probablement bloqué)",
        preview: data.toString().slice(0, 200)
      });
    }

    res.json(parsed);

  } catch (error) {
    res.status(500).json({
      error: "Erreur récupération données",
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
