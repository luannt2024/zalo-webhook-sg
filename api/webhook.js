const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    // Kiểm tra phương thức POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Lấy dữ liệu từ Zalo
    const zaloData = req.body;

    // Chuyển tiếp dữ liệu đến n8n webhook
    const n8nWebhookUrl = 'https://thanhluan130301.app.n8n.cloud/webhook-test/receive-chatgpt';
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zaloData),
    });

    // Kiểm tra phản hồi từ n8n
    if (!response.ok) {
      throw new Error(`n8n webhook responded with status ${response.status}`);
    }

    const responseData = await response.json();

    // Trả về phản hồi cho Zalo (Zalo yêu cầu HTTP 200)
    res.status(200).json({
      status: 'success',
      data: responseData,
    });
  } catch (error) {
    console.error('Error forwarding webhook:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};