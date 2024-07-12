// /api/fetchData.js
import fetch from 'node-fetch'; 

export default async (req, res) => {
  // 从环境变量中获取API密钥
  const API_KEY = 'AIzaSyBqvUA2o2rSk1hpJilfQmVrPBIsWj5etUk';
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  // 确保请求方法为POST
  if (req.method !== 'POST') {
    console.log("11111111111111111111");
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 获取请求体中的blogContent
  const { blogContent } = req.body;

  // 检查blogContent是否存在
  if (!blogContent) {
    return res.status(400).json({ error: 'Blog content is required' });
  }

  // 构建prompt
  const prompt = `请对以下文章内容进行100-200字的总结：\n\n${blogContent}`;

  // 构建请求数据
  const requestData = {
    model: 'gemini-pro',
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
  };

  try {
    // 发送POST请求到第三方API
    const response = await fetch(`${apiUrl}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    // 检查响应状态
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // 解析响应数据
    const data = await response.json();

    // 从响应中提取摘要内容
    const summaryText = data.candidates[0].content.parts[0].text;

    // 返回摘要内容
    res.status(200).json({ summary: summaryText });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '摘要生成失败，请稍后再试。' });
  }
};
