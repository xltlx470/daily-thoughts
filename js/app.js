/* ====================================
   app.js - 主逻辑与路由
   ==================================== */

DT = window.DT || {};

DT.getToday = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

DT.showChat = async (date) => {
  document.getElementById('chatView').classList.add('active');
  document.getElementById('historyView').classList.remove('active');
  document.getElementById('historyBtn').style.display = '';
  document.getElementById('inputFooter').style.display = '';

  await DT.chat.loadDate(date || DT.getToday());
};

DT.showHistory = async () => {
  document.getElementById('chatView').classList.remove('active');
  document.getElementById('historyView').classList.add('active');
  document.getElementById('historyBtn').style.display = 'none';
  document.getElementById('inputFooter').style.display = 'none';

  const container = document.getElementById('historyList');
  container.innerHTML = '<div class="empty-state"><p>加载中...</p></div>';

  try {
    const allChats = await DT.db.getAllChats();
    container.innerHTML = '';

    // Only show days that have messages
    const valid = allChats.filter(c => c.messages && c.messages.length > 0);

    if (valid.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>还没有任何记录<br>开始聊天吧 💬</p></div>';
      return;
    }

    // Sort by date descending
    valid.sort((a, b) => b.date.localeCompare(a.date));

    valid.forEach(chat => {
      const card = document.createElement('div');
      card.className = 'history-card';
      card.onclick = () => DT.showChat(chat.date);

      const preview = chat.summary
        ? chat.summary.content.slice(0, 80) + '…'
        : '暂无总结，点击查看对话';

      card.innerHTML = `
        <div class="date">📅 ${chat.date}</div>
        <div class="preview">${preview}</div>
        <div class="meta">${Math.ceil(chat.messages.length / 2)} 轮对话</div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>加载失败：${err.message}</p></div>`;
  }
};

/* ---------- Init ---------- */

DT.init = async () => {
  // Init DB
  try {
    await DT.db.init();
  } catch (err) {
    document.body.innerHTML = `<div style="padding:40px;text-align:center;color:red;">数据库初始化失败：${err.message}</div>`;
    return;
  }

  // Init voice
  DT.voice.init();

  // Load saved API key
  const savedKey = localStorage.getItem('deepseek_api_key');
  if (savedKey) {
    document.getElementById('apiKeyInput').value = savedKey;
  } else {
    // Show settings dialog first time
    setTimeout(() => {
      document.getElementById('settingsDialog').classList.add('open');
    }, 300);
  }

  // Load today's chat
  await DT.showChat(DT.getToday());

  // ---- Event Listeners ----

  // Send
  document.getElementById('sendBtn').addEventListener('click', () => {
    DT.chat.sendMessage();
  });

  // Enter key
  document.getElementById('messageInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      DT.chat.sendMessage();
    }
  });

  // Voice
  document.getElementById('voiceBtn').addEventListener('click', () => {
    if (DT.voice.isListening) {
      DT.voice.stopListening();
    } else {
      DT.voice.startListening();
    }
  });

  // History
  document.getElementById('historyBtn').addEventListener('click', DT.showHistory);

  // Back to today
  document.getElementById('backBtn').addEventListener('click', () => {
    DT.showChat(DT.getToday());
  });

  // Settings
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsDialog').classList.add('open');
  });

  // Save settings
  document.getElementById('saveSettings').addEventListener('click', () => {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (key) {
      localStorage.setItem('deepseek_api_key', key);
      document.getElementById('settingsDialog').classList.remove('open');
    }
  });

  // Close settings on backdrop click
  document.getElementById('settingsDialog').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      e.target.classList.remove('open');
    }
  });
};

// Start
document.addEventListener('DOMContentLoaded', () => DT.init());
