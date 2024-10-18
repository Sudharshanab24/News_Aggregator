require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

// CORS configuration
app.use(cors({
  origin: '*', // Be cautious with this in production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helper function for API requests
async function makeApiRequest(url) {
  try {
    const response = await axios.get(url);

    // Filter articles that have a valid non-empty urlToImage and not a placeholder
    let articlesWithImages = response.data.articles.filter(article => {
      return article.urlToImage && isValidUrl(article.urlToImage) && !isPlaceholderImage(article.urlToImage);
    });

    return {
      status: 200,
      success: true,
      message: "Successfully fetched the data",
      data: {
        ...response.data,
        articles: articlesWithImages
      },
    };
  } catch (error) {
    console.error("API request error:", error.response ? error.response.data : error);
    return {
      status: 500,
      success: false,
      message: "Failed to fetch data from the API",
      error: error.response ? error.response.data : error.message,
    };
  }
}

// Helper function to validate URLs
function isValidUrl(url) {
  try {
    return url.startsWith("http://") || url.startsWith("https://");
  } catch (e) {
    return false;
  }
}

// Helper function to check for placeholder images
function isPlaceholderImage(url) {
  // A basic check for common placeholder patterns like "img", "default", etc.
  const placeholders = ["img", "default", "placeholder"];
  return placeholders.some(placeholder => url.includes(placeholder));
}

app.get("/all-news", async (req, res) => {
  let pageSize = parseInt(req.query.pageSize) || 80;  let page = parseInt(req.query.page) || 1;
  let q = req.query.q || 'world'; // Default search query if none provided

  let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}&apiKey=${process.env.API_KEY}`;
  const result = await makeApiRequest(url);
  console.log(result);

  res.status(result.status).json(result);
});

app.get("/top-headlines", async (req, res) => {
  let pageSize = parseInt(req.query.pageSize) || 80;
  let page = parseInt(req.query.page) || 1;
  let category = req.query.category || "business";

  let url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&page=${page}&pageSize=${pageSize}&apiKey=${process.env.API_KEY}`;
  const result = await makeApiRequest(url);
  res.status(result.status).json(result);
});

app.get("/country/:iso", async (req, res) => {
  let pageSize = parseInt(req.query.pageSize) || 80;
  let page = parseInt(req.query.page) || 1;
  const country = req.params.iso;

  let url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${process.env.API_KEY}`;
  const result = await makeApiRequest(url);
  res.status(result.status).json(result);
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log(`Server is running at port ${PORT}`);
});
