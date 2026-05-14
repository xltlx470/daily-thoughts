/* ====================================
   db.js - IndexedDB 数据存储层
   ==================================== */

DT = window.DT || {};

DT.db = {
  db: null,

  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('daily-thoughts', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('chats')) {
          db.createObjectStore('chats', { keyPath: 'date' });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },

  getChat(date) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('chats', 'readonly');
      const store = tx.objectStore('chats');
      const request = store.get(date);
      request.onsuccess = () => {
        resolve(request.result || { date, messages: [], summary: null });
      };
      request.onerror = () => reject(request.error);
    });
  },

  saveChat(chat) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('chats', 'readwrite');
      const store = tx.objectStore('chats');
      const request = store.put(chat);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getAllChats() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('chats', 'readonly');
      const store = tx.objectStore('chats');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
};
