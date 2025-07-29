const express = require('express');
const app = express();
app.use(express.json());

module.exports = async (req, res) => {
  console.log('Nhận webhook từ Zalo:', JSON.stringify(req.body, null, 2));
  res.status(200).send('Nhận webhook thành công');

  const userMessage = req.body.message?.text;
  const userId = req.body.sender?.id;

  if (!userMessage || !userId) {
    console.error('Thiếu userMessage hoặc userId:', JSON.stringify(req.body, null, 2));
    return;
  }

  try {
    console.log('Gửi yêu cầu đến API Python...', userMessage, userId);
    const startTime = Date.now();

    const response = await fetch('https://cb08-35-222-65-213.ngrok-free.app/chat', {  // Thay bằng URL từ Colab
      method: 'POST',
 headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'  // Thêm header để bỏ qua cảnh báo
      },
      body: JSON.stringify({
        message: `You are a sales assistant at a clothing store. Help the customer with their query: ${userMessage}`
      }),
      signal: AbortSignal.timeout(30000)
    });

    const endTime = Date.now();
    console.log(`Thời gian phản hồi từ API Python: ${(endTime - startTime) / 1000} giây`);

    const chatbotResponse = await response.json();
    console.log('Phản hồi từ chatbot (raw):', JSON.stringify(chatbotResponse, null, 2));
    const botReply = chatbotResponse.response;
    console.log('Phản hồi từ chatbot (text):', botReply);

    console.log('Gửi phản hồi về Zalo...');
    const zaloResponse = await fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
      method: 'POST',
      headers: {
          'access_token': 'FBdUMEpBcqKykTvKviEUJJYvtr7YrVCNOlta2zAC-cvBjCSDrOU3KWwMiH-5defo6UIbCiIUZ2zfgPCrnPA2RtEOmHtnbi9PVBZzAQsvpqHpkCClgeFcIIgUvnIMXUiFEuFFVxQarIvhaEL1nPxWB6Qeu3J3kgTKTPks1DRjbHb9mATdqxQW06AtuKpnW_GqMOklLOITdGvRXP9Cvv-fLdIGYXRBbfbMUhoeDkQjjNTMcxSIvv2LTdcqYX6caAbKBRsGH9kndWy8lQiLbO-fR2QfcHwkdTOET9NuJzMDlLDD_Qq8dFIi4pY7XNUBbAHjDVla2wJ-wdSS_iuIaEgAVY_Ib3gWzQr8USEn1VUoinnHkeC1ySkjHI_bbG2LzR453kV-IDB3l3XHphvyOddfGdOeuTMRGG',        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient: {
          user_id: userId
        },
        message: {
          text: botReply
        }
      })
    });

    if (!zaloResponse.ok) {
      throw new Error(`Zalo API error: ${zaloResponse.statusText}`);
    }
    console.log('Đã gửi phản hồi về Zalo:', botReply);
  } catch (err) {
    console.error('Lỗi khi gọi API Python hoặc Zalo:', err.message, err.stack);
    try {
      const errorResponse = await fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
        method: 'POST',
        headers: {
          'access_token': 'FBdUMEpBcqKykTvKviEUJJYvtr7YrVCNOlta2zAC-cvBjCSDrOU3KWwMiH-5defo6UIbCiIUZ2zfgPCrnPA2RtEOmHtnbi9PVBZzAQsvpqHpkCClgeFcIIgUvnIMXUiFEuFFVxQarIvhaEL1nPxWB6Qeu3J3kgTKTPks1DRjbHb9mATdqxQW06AtuKpnW_GqMOklLOITdGvRXP9Cvv-fLdIGYXRBbfbMUhoeDkQjjNTMcxSIvv2LTdcqYX6caAbKBRsGH9kndWy8lQiLbO-fR2QfcHwkdTOET9NuJzMDlLDD_Qq8dFIi4pY7XNUBbAHjDVla2wJ-wdSS_iuIaEgAVY_Ib3gWzQr8USEn1VUoinnHkeC1ySkjHI_bbG2LzR453kV-IDB3l3XHphvyOddfGdOeuTMRGG',          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: {
            user_id: userId
          },
          message: {
            text: 'Hệ thống gặp lỗi, bạn vui lòng thử lại sau nhé!'
          }
        })
      });

      if (!errorResponse.ok) {
        throw new Error(`Zalo API error: ${errorResponse.statusText}`);
      }
      console.log('Đã gửi tin nhắn lỗi về Zalo.');
    } catch (zaloErr) {
      console.error('Lỗi khi gửi lỗi về Zalo:', zaloErr.message, zaloErr.stack);
    }
  }
};