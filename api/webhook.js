const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/api/webhook', async (req, res) => {
  console.log('Nhận webhook từ Zalo:', req.body);
  
  // Trả về 200 ngay lập tức cho Zalo

  // Gửi dữ liệu sang n8n
  try {
    await axios.post('https://vuductap.app.n8n.cloud/webhook-test/zalo-test', req.body);
      res.status(200).send('Nhận webhook từ Zalo: ' + JSON.stringify(req.body));

    console.log('Đã gửi sang n8n:', req.body);
  } catch (err) {
    console.error('Lỗi gửi sang n8n:', err.message);
  }
});

module.exports = app;