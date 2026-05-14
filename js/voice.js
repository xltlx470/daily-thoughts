/* ====================================
   voice.js - 语音输入 (Web Speech API)
   ==================================== */

DT = window.DT || {};

DT.voice = {
  recognition: null,
  isListening: false,
  supported: false,

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const btn = document.getElementById('voiceBtn');
      if (btn) btn.style.display = 'none';
      return;
    }

    this.supported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'zh-CN';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          const input = document.getElementById('messageInput');
          input.value = transcript;
          // Auto-send if it's a short utterance
          if (transcript.trim().length > 0) {
            DT.chat.sendMessage();
          }
        }
      }
    };

    this.recognition.onerror = (e) => {
      console.warn('语音识别错误:', e.error);
      this.stopListening();
    };

    this.recognition.onend = () => {
      this.stopListening();
    };
  },

  startListening() {
    if (!this.supported || !this.recognition) return;
    if (this.isListening) return;

    this.isListening = true;
    document.getElementById('voiceBtn').classList.add('listening');
    document.getElementById('voiceBtn').textContent = '🔴';

    try {
      this.recognition.start();
    } catch (e) {
      // Already started
    }
  },

  stopListening() {
    this.isListening = false;
    const btn = document.getElementById('voiceBtn');
    if (btn) {
      btn.classList.remove('listening');
      btn.textContent = '🎤';
    }
    try { this.recognition?.stop(); } catch {}
  }
};
