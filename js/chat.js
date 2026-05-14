/* ====================================
   chat.js - 聊天管理
   ==================================== */

DT = window.DT || {};

DT.chat = {
  currentChat: null,

  async loadDate(date) {
    this.currentChat = await DT.db.getChat(date);
    this.render();
  },

  render() {
    this.renderMessages();
    this.renderSummary();
  },

  renderMessages() {
    const container = document.getElementById('messages');
    container.innerHTML = '';

    if (!this.currentChat.messages.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🌅</div>
          <div class="greeting">今天过得怎么样？</div>
          <p>随便聊聊你的想法、心情、计划……<br>我会帮你记录下来，每天生成一份总结。</p>
        </div>
      `;
      return;
    }

    // Add date divider
    const dateDiv = document.createElement('div');
    dateDiv.className = 'message system';
    dateDiv.textContent = `— ${this.currentChat.date} —`;
    container.appendChild(dateDiv);

    this.currentChat.messages.forEach(msg => {
      this._appendBubble(msg.role, msg.content);
    });

    container.scrollTop = container.scrollHeight;
  },

  _appendBubble(role, content) {
    const container = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = content;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  _showTyping() {
    const container = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    div.id = 'typingIndicator';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  _hideTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  },

  async sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    if (!content) return;

    input.value = '';

    // Remove empty state
    const empty = document.querySelector('.empty-state');
    if (empty) empty.remove();

    // Add user message
    const userMsg = { role: 'user', content, timestamp: Date.now() };
    this.currentChat.messages.push(userMsg);
    this._appendBubble('user', content);

    // Persist immediately
    await DT.db.saveChat(this.currentChat);

    // Show typing
    this._showTyping();

    try {
      const apiMessages = [
        {
          role: 'system',
          content:
            '你是一个贴心的思绪记录助手。你温和、善于倾听，帮助用户梳理和记录他们的想法。\n' +
            '用中文交流，语气温暖自然。多问开放性问题，引导用户深入思考。\n' +
            '不要过度评价或分析，重点是帮助用户理清思路。\n' +
            '回复简洁自然，通常 2-4 句话就好。'
        },
        ...this.currentChat.messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      ];

      const reply = await DT.api.chat(apiMessages);

      this._hideTyping();

      const assistantMsg = { role: 'assistant', content: reply, timestamp: Date.now() };
      this.currentChat.messages.push(assistantMsg);
      this._appendBubble('assistant', reply);

      await DT.db.saveChat(this.currentChat);
      this.renderSummary();
    } catch (err) {
      this._hideTyping();
      this._appendBubble('assistant', `😅 ${err.message}`);
    }
  },

  renderSummary() {
    const container = document.getElementById('summaryBanner');
    const chat = this.currentChat;

    if (!chat || !chat.messages.length) {
      container.style.display = 'none';
      return;
    }

    if (chat.summary) {
      container.style.display = 'block';
      container.innerHTML = `
        <h3>📝 今日总结</h3>
        <p>${chat.summary.content}</p>
      `;
    } else if (chat.messages.length >= 3) {
      container.style.display = 'block';
      container.innerHTML = `
        <h3>📝 每日总结</h3>
        <p>已经记录了 ${Math.ceil(chat.messages.length / 2)} 轮对话，要生成一份总结吗？</p>
        <div class="summary-actions">
          <button onclick="DT.summary.generate()">✨ 生成总结</button>
        </div>
      `;
    } else {
      container.style.display = 'none';
    }
  }
};
