/* ====================================
   summary.js - 每日总结生成
   ==================================== */

DT = window.DT || {};

DT.summary = {
  async generate() {
    const banner = document.getElementById('summaryBanner');
    const btn = banner?.querySelector('button');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '生成中...';
    }

    try {
      const systemPrompt =
        '你是一个贴心的思绪记录助手。以下是用户今天的所有对话记录。' +
        '请用中文写一份简洁的每日总结，涵盖：\n' +
        '1. 💡 核心想法：今天用户主要在思考什么\n' +
        '2. 😊 情绪状态：用户的情绪变化\n' +
        '3. 📌 关键收获：今天的启发或决定\n\n' +
        '语气温暖鼓励，200字以内，用第一人称（"你"）。';

      const msgs = DT.chat.currentChat.messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const summaryText = await DT.api.chat([
        { role: 'system', content: systemPrompt },
        ...msgs
      ]);

      DT.chat.currentChat.summary = {
        content: summaryText,
        generatedAt: Date.now()
      };

      await DT.db.saveChat(DT.chat.currentChat);
      DT.chat.renderSummary();
    } catch (err) {
      DT.chat.renderSummary();
      setTimeout(() => alert('生成总结失败：' + err.message), 100);
    }
  }
};
