export default async (req, res) => {
  console.log(`Received ${req.method} request`); // 调试日志

  if (req.method !== 'POST') {
    console.error('Invalid request method');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const API_KEY = 'AIzaSyBqvUA2o2rSk1hpJilfQmVrPBIsWj5etUk';
  console.log(`API_KEY: ${API_KEY}`); // 调试日志
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  const { blogContent } = req.body;
  console.log(`Received blogContent: ${blogContent}`); // 调试日志

  if (!blogContent) {
    console.error('Missing blogContent');
    return res.status(400).json({ error: 'Blog content is required' });
  }

  const prompt = `请对以下文章内容进行100-200字的总结：\n\n${blogContent}`;

  const requestData = {
    model: 'gemini-pro',
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
  };

  try {
    const response = await fetch(`${apiUrl}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      console.error('Network response was not ok', response.statusText);
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const summaryText = data.candidates[0].content.parts[0].text;

    res.status(200).json({ summary: summaryText });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '摘要生成失败，请稍后再试。' });
  }
};
