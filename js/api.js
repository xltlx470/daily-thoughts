/* ====================================
   api.js - DeepSeek API 调用
   ==================================== */

DT = window.DT || {};

DT.api = {
  baseURL: 'https://api.deepseek.com/v1/chat/completions',

  async chat(messages) {
    const apiKey = localStorage.getItem('deepseek_api_key');
    if (!apiKey) throw new Error('请先在设置中填入 DeepSeek API Key');

    const body = {
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 2048
    };

    const res = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      let msg = `API 请求失败 (${res.status})`;
      try {
        const err = await res.json();
        if (err.error?.message) msg = err.error.message;
      } catch {}
      throw new Error(msg);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  }
};
