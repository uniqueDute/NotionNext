export default async (req, res) => {
  console.log(`Received ${req.method} request`); // 调试日志

  if (req.method !== 'POST') {
    console.error('Invalid request method');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const API_KEY = process.env.API_KEY;
  const API_URL = process.env.API_URL;

  const { blogContent } = req.body;
  console.log(`Received blogContent: ${blogContent}`); // 调试日志

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

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    console.log(`API request status: ${response.status}`); // 调试日志
    if (!response.ok) {
      console.error('Network response was not ok', response.statusText);
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('API response data:', data); // 调试日志

    if (data.candidates && data.candidates.length > 0) {
      const summaryText = data.candidates[0].content.parts[0].text;
      console.log('Summary text:', summaryText); // 调试日志
      res.status(200).json({ summary: summaryText });
    } else {
      console.error('No candidates found in the response');
      res.status(500).json({ error: 'No summary generated' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '摘要生成失败，请稍后再试。' });
  }
};