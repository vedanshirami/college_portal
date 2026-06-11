const axios = require('axios');

const chatWithAI = async (req, res) => {
  try {
    const { prompt, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let contents = [];
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }
    
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const systemInstruction = {
      parts: [
        {
          text: `You are the official AI Assistant for IIIT Allahabad (Indian Institute of Information Technology, Allahabad). 
Location: Prayagraj. 
Main courses/branches offered: Information Technology (IT) and Electronics and Communication Engineering (ECE).
Additional info: The average placement package is 27 LPA. The main cultural fest is named Effervescence.
Always be polite, helpful, and concise. Your goal is to assist students, faculty, and alumni regarding college-related queries.`
        }
      ]
    };

    const response = await axios.post(url, { systemInstruction, contents }, {
       headers: {
         'Content-Type': 'application/json'
       }
    });

    const reply = response.data.candidates[0].content.parts[0].text;
    
    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("AI Error:", error.response?.data?.error || error.message);
    res.status(500).json({ success: false, message: "Error communicating with AI" });
  }
};

module.exports = { chatWithAI };