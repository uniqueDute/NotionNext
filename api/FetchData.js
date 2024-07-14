import { setTimeout } from 'timers/promises';

let lastRequestTime = 0;
const REQUEST_INTERVAL = 2000; // 2 seconds interval in milliseconds

export default async (req, res) => {
  try {
    console.log(`Received ${req.method} request`);

    if (req.method !== 'POST') {
      console.error('Invalid request method');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const API_KEYS = process.env.API_KEYS ? process.env.API_KEYS.split(',').map(key => key.trim()).filter(Boolean) : [];
    const API_URL = process.env.API_URL;

    console.log(`Number of API keys: ${API_KEYS.length}`);

    if (API_KEYS.length === 0) {
      console.error('No valid API keys found');
      return res.status(500).json({ error: 'Server configuration error: No valid API keys' });
    }

    if (!API_URL) {
      console.error('Missing API_URL');
      return res.status(500).json({ error: 'Server configuration error: Missing API_URL' });
    }

    let currentKeyIndex = 0;

    const { blogContent } = req.body;
    console.log(`Received blogContent length: ${blogContent ? blogContent.length : 0}`);

    if (!blogContent) {
      console.error('Missing blogContent');
      return res.status(400).json({ error: 'Blog content is required' });
    }

    const prompt = `你是一个摘要生成工具,你需要解释我发送给你的内容,不要换行,不要超过200字,不要包含链接,只需要简单介绍文章的内容,不需要提出建议和缺少的东西,不要提及用户.请用中文回答,下面这篇文章讲述了什么?\n\n${blogContent}`;

    const requestData = {
      model: 'gemini-pro',
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
    };

    const makeRequest = async (retryCount = 0) => {
      if (retryCount >= API_KEYS.length) {
        throw new Error('All API keys have been tried without success');
      }

      const now = Date.now();
      if (now - lastRequestTime < REQUEST_INTERVAL) {
        const delay = REQUEST_INTERVAL - (now - lastRequestTime);
        console.log(`Rate limit reached. Waiting for ${delay}ms before next request.`);
        await setTimeout(delay);
      }

      lastRequestTime = Date.now();

      const currentKey = API_KEYS[currentKeyIndex];
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;

      console.log(`Attempting request with key index: ${currentKeyIndex}`);

      try {
        const response = await fetch(`${API_URL}?key=${currentKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });

        console.log(`API request status: ${response.status}`);

        if (!response.ok) {
          console.error('Network response was not ok', response.statusText);
          const responseText = await response.text();
          console.error('Response body:', responseText);
          
          // If we have multiple keys, try the next one
          if (API_KEYS.length > 1) {
            return makeRequest(retryCount + 1);
          } else {
            // If we only have one key, throw an error to be caught by the outer try-catch
            throw new Error(`API request failed: ${response.status} ${response.statusText}. Response: ${responseText}`);
          }
        }

        return await response.json();
      } catch (error) {
        console.error(`Error with API key ${currentKey}:`, error);
        if (API_KEYS.length > 1) {
          return makeRequest(retryCount + 1);
        } else {
          throw error; // Re-throw the error if we only have one key
        }
      }
    };

    const data = await makeRequest();
    console.log('API response received');

    if (data.candidates && data.candidates.length > 0) {
      const summaryText = data.candidates[0].content.parts[0].text;
      console.log(`Summary generated, length: ${summaryText.length}`);
      res.status(200).json({ summary: summaryText });
    } else {
      console.error('No candidates found in the response');
      console.error('Full API response:', JSON.stringify(data));
      res.status(500).json({ error: 'No summary generated' });
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: '摘要生成失败，请稍后再试。', details: error.message });
  }
};