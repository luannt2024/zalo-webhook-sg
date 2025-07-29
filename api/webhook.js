const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/api/webhook', async (req, res) => {
  console.log('Nhận webhook từ Zalo:', req.body);

  // Trả về 200 ngay lập tức
  res.sendStatus(200);

  // Gửi dữ liệu sang n8n (xử lý không chặn phản hồi tới Zalo)
  try {
    await axios.post('https://vuductap.app.n8n.cloud/webhook-test/zalo-test', req.body);
    console.log('Đã gửi sang n8n:', req.body);
  } catch (err) {
    console.error('Lỗi gửi sang n8n:', err.message);
  }
});

module.exports = app;
