export default async (req, res) => {
  console.log(`收到 ${req.method} 请求`);

  if (req.method !== 'POST') {
    console.error('无效的请求方法');
    return res.status(405).json({ error: '方法不允许' });
  }

  const API_KEY = process.env.API_KEY;
  const API_URL = process.env.API_URL;
  const { blogContent } = req.body;

  if (!blogContent) {
    console.error('缺少 blogContent');
    return res.status(400).json({ error: '需要提供博客内容' });
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
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      console.error('网络响应不正常', response.statusText);
      return res.status(response.status).json({ error: '网络响应不正常' });
    }

    // 设置流式响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const data = JSON.parse(chunk);

      if (data.candidates && data.candidates.length > 0) {
        data.candidates.forEach(candidate => {
          const summaryText = candidate.content.parts.map(part => part.text).join('');
          res.write(`data: ${JSON.stringify({ summary: summaryText })}\n\n`);
        });
      }
    }

    res.end();
  } catch (error) {
    console.error('错误:', error);
    res.status(500).json({ error: '请求处理失败，请稍后再试。' });
  }
};
