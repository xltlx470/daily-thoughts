# 每日思绪 📝

一个在手机上运行的 Web App，每天和你对话，记录并总结你的想法。

## 使用步骤

### 1. 获取 DeepSeek API Key

1. 打开 [platform.deepseek.com](https://platform.deepseek.com) 注册账号
2. 进入 API Keys 页面，创建一个新的 API Key
3. 复制保存，后续在 App 中使用

### 2. 本地运行

直接用浏览器打开 `index.html` 即可（推荐 Chrome）。

或者用 Python 启动一个本地服务器：

```bash
python -m http.server 8080
```

然后手机和电脑连同一个 WiFi，手机浏览器访问 `http://你的电脑IP:8080`

### 3. 部署到 Vercel（免费，推荐）

1. 把整个文件夹推送到 GitHub
2. 打开 [vercel.com](https://vercel.com) 导入该仓库
3. 部署配置保持默认即可
4. 部署成功后，在手机上打开 Vercel 生成的域名
5. 用浏览器菜单「添加到主屏幕」，就像原生 App 一样使用

### 4. 生成 PWA 图标（可选）

如果需要生成 PNG 图标，可以用这个 Node.js 脚本生成：

```bash
node generate-icons.js
```

## 项目结构

```
daily-thoughts/
├── index.html           # 主页面
├── css/style.css        # 样式
├── js/
│   ├── db.js            # 数据存储 (IndexedDB)
│   ├── api.js           # DeepSeek API 调用
│   ├── voice.js         # 语音输入
│   ├── summary.js       # 每日总结
│   ├── chat.js          # 聊天逻辑
│   └── app.js           # 主逻辑
├── manifest.json        # PWA 配置
├── service-worker.js    # 离线缓存
└── icon.svg             # 应用图标
```

## 技术说明

- 纯前端，不需要服务器
- 数据全部存储在手机本地 (IndexedDB)
- 支持语音输入 (Web Speech API)
- 支持添加到桌面离线使用 (PWA)
