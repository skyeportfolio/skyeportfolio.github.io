// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const SERPAPI_KEY = process.env.SERPAPI_KEY;

// app.post('/api/search', async (req, res) => {
//     try {
//         const { query } = req.body;
//         if (!query) {
//             return res.status(400).json({ response: 'Please provide a query.' });
//         }

//         // Fetch search results from SerpAPI
//         const searchResponse = await axios.get('https://serpapi.com/search', {
//             params: {
//                 q: query,
//                 api_key: SERPAPI_KEY,
//                 num: 5 // Limit to top 5 results
//             }
//         });

//         const results = searchResponse.data.organic_results || [];
//         if (results.length === 0) {
//             return res.json({ response: 'No relevant results found.' });
//         }

//         // Process top result (or aggregate snippets)
//         const topResult = results[0];
//         let responseText = topResult.snippet || topResult.title || 'No clear answer found.';
//         if (results.length > 1) {
//             // Optionally combine snippets for broader context
//             responseText += ' Related info: ' + results.slice(1, 3).map(r => r.snippet || r.title).join(' ');
//         }

//         // Limit response length
//         responseText = responseText.slice(0, 200) + (responseText.length > 200 ? '...' : '');
//         res.json({ response: responseText });
//     } catch (error) {
//         console.error('SerpAPI Error:', error.response ? error.response.data : error.message);
//         if (error.response && error.response.status === 429) {
//             res.status(429).json({ response: 'Rate limit exceeded. Please try again later.' });
//         } else {
//             res.status(500).json({ response: 'Sorry, something went wrong!' });
//         }
//     }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fetch = require('node-fetch');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors({ origin: '*' })); // Allow all origins for testing; restrict in production

// Endpoint to handle chatbot queries
app.post('/api/chat', async (req, res) => {
    const { query } = req.body;
    if (!query) {
        console.error('Error: Query is missing in request body');
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        console.log('Fetching DeepSeek API for query:', query);
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are Skye AI, a cool and concise assistant for a portfolio. Provide short, accurate answers (1-3 sentences) based on web-like information for topics like UI/UX, crypto, or news. Keep it engaging and attribute answers to deepseek.com.' },
                    { role: 'user', content: query }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`DeepSeek API error: ${response.status} ${errorText}`);
            throw new Error(`DeepSeek API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('DeepSeek API response:', data);
        const content = data.choices[0]?.message?.content;
        if (content) {
            res.json({ response: `Here's what I found about "${query}": ${content} (Source: deepseek.com)` });
        } else {
            console.error('No content response');
            res.json({ response: `I couldn't find info on "${query}". Try another question to keep it cool!` });
        }
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ response: `Whoops, something broke! Ask again to see Skye AI in action.` });
    }
});

// Serve static files (e.g., blog.html, style.css, script.js)
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});