# GitHub Global - 后端 API 接口文档

> 版本：v1.0.0  
> 日期：2026-01-21  
> 基准 URL：`/api`

---

## 1. 认证接口

### 1.1 GitHub OAuth 登录

**由 NextAuth.js 自动处理**

- **登录入口**: `GET /api/auth/signin`
- **回调地址**: `GET /api/auth/callback/github`
- **登出**: `GET /api/auth/signout`
- **获取会话**: `GET /api/auth/session`

---

## 2. 仓库管理接口

### 2.1 获取用户仓库列表

```
GET /api/repos
```

**响应示例**:
```json
{
  "repos": [
    {
      "id": "repo_123",
      "githubRepoId": 456789,
      "owner": "username",
      "name": "my-repo",
      "fullName": "username/my-repo",
      "description": "项目描述",
      "defaultBranch": "main",
      "isPrivate": false,
      "lastSyncedAt": "2026-01-21T10:00:00Z",
      "config": {
        "baseLanguage": "zh-CN",
        "targetLanguages": ["en", "ja"]
      }
    }
  ]
}
```

---

### 2.2 导入仓库

```
POST /api/repos
```

**请求体**:
```json
{
  "repoUrl": "https://github.com/username/repo-name"
}
```

**响应示例**:
```json
{
  "success": true,
  "repository": {
    "id": "repo_123",
    "fullName": "username/repo-name",
    "owner": "username",
    "name": "repo-name"
  }
}
```

---

### 2.3 获取仓库详情

```
GET /api/repos/:id
```

**响应示例**:
```json
{
  "id": "repo_123",
  "owner": "username",
  "name": "my-repo",
  "fullName": "username/my-repo",
  "defaultBranch": "main",
  "config": {
    "baseLanguage": "zh-CN",
    "targetLanguages": ["en", "ja", "ko"],
    "includePaths": ["docs/**", "README.md"],
    "excludePaths": ["node_modules/**"],
    "aiModel": "anthropic/claude-3.5-sonnet"
  },
  "translationTasks": [
    {
      "id": "task_123",
      "status": "COMPLETED",
      "targetLanguages": ["en", "ja"],
      "progress": 100,
      "pullRequestUrl": "https://github.com/username/my-repo/pull/1",
      "createdAt": "2026-01-21T10:00:00Z"
    }
  ]
}
```

---

### 2.4 更新仓库配置

```
PUT /api/repos/:id/config
```

**请求体**:
```json
{
  "baseLanguage": "zh-CN",
  "targetLanguages": ["en", "ja", "ko"],
  "includePaths": ["docs/**", "README.md"],
  "excludePaths": ["node_modules/**", ".github/**"],
  "aiModel": "anthropic/claude-3.5-sonnet"
}
```

**响应示例**:
```json
{
  "success": true,
  "config": {
    "baseLanguage": "zh-CN",
    "targetLanguages": ["en", "ja", "ko"]
  }
}
```

---

### 2.5 获取仓库文件树

```
GET /api/repos/:id/files
```

**响应示例**:
```json
{
  "tree": [
    {
      "name": "README.md",
      "path": "README.md",
      "type": "file",
      "isMarkdown": true
    },
    {
      "name": "docs",
      "path": "docs",
      "type": "dir",
      "children": [
        {
          "name": "guide.md",
          "path": "docs/guide.md",
          "type": "file",
          "isMarkdown": true
        }
      ]
    }
  ]
}
```

---

## 3. 翻译任务接口

### 3.1 创建翻译任务

```
POST /api/translations
```

**请求体**:
```json
{
  "repositoryId": "repo_123",
  "targetLanguages": ["en", "ja", "ko"],
  "type": "FULL"
}
```

- `type`: `"FULL"` (全量翻译) 或 `"INCREMENTAL"` (增量翻译)

**响应示例**:
```json
{
  "success": true,
  "taskId": "task_123"
}
```

**错误响应** (限流):
```json
{
  "error": "Daily limit exceeded. Please try again tomorrow or add your own API key."
}
```
状态码: `429`

---

### 3.2 获取翻译任务详情

```
GET /api/translations/:id
```

**响应示例**:
```json
{
  "id": "task_123",
  "status": "RUNNING",
  "type": "FULL",
  "targetLanguages": ["en", "ja"],
  "totalFiles": 10,
  "completedFiles": 5,
  "failedFiles": 0,
  "progress": 50.0,
  "pullRequestUrl": null,
  "pullRequestNumber": null,
  "startedAt": "2026-01-21T10:00:00Z",
  "completedAt": null,
  "translatedFiles": [
    {
      "id": "file_1",
      "sourcePath": "README.md",
      "targetPath": "translations/en/README.md",
      "targetLanguage": "en",
      "status": "COMPLETED"
    },
    {
      "id": "file_2",
      "sourcePath": "docs/guide.md",
      "targetPath": "translations/en/docs/guide.md",
      "targetLanguage": "en",
      "status": "TRANSLATING"
    }
  ]
}
```

**状态枚举**:
- `PENDING`: 等待中
- `RUNNING`: 运行中
- `COMPLETED`: 已完成
- `FAILED`: 失败
- `CANCELLED`: 已取消

---

### 3.3 实时获取翻译进度 (SSE)

```
GET /api/translations/:id/progress
```

**响应类型**: `text/event-stream`

**事件数据格式**:
```json
{
  "status": "RUNNING",
  "progress": 50.0,
  "completedFiles": 5,
  "totalFiles": 10,
  "failedFiles": 0,
  "files": [
    {
      "id": "file_1",
      "sourcePath": "README.md",
      "targetLanguage": "en",
      "status": "COMPLETED"
    }
  ],
  "pullRequestUrl": null
}
```

**前端使用示例**:
```javascript
const eventSource = new EventSource('/api/translations/task_123/progress');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('进度:', data.progress);
  
  if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(data.status)) {
    eventSource.close();
  }
};
```

---

## 4. 用户设置接口

### 4.1 保存 OpenRouter API Key

```
POST /api/settings/api-key
```

**请求体**:
```json
{
  "provider": "openrouter",
  "apiKey": "sk-or-v1-xxxxxxxxxxxxxxxx"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "API Key saved successfully"
}
```

---

### 4.2 删除 API Key

```
DELETE /api/settings/api-key/:id
```

**响应示例**:
```json
{
  "success": true
}
```

---

### 4.3 获取用户使用量

```
GET /api/settings/usage
```

**响应示例**:
```json
{
  "today": {
    "date": "2026-01-21",
    "count": 5,
    "limit": 10
  },
  "hasApiKey": false
}
```

---

## 5. 常量数据

### 5.1 支持的语言列表

```
GET /api/constants/languages
```

**响应示例**:
```json
{
  "languages": [
    { "code": "en", "name": "英语", "nativeName": "English" },
    { "code": "zh-CN", "name": "简体中文", "nativeName": "Simplified Chinese" },
    { "code": "zh-TW", "name": "繁体中文", "nativeName": "Traditional Chinese" },
    { "code": "ja", "name": "日语", "nativeName": "Japanese" },
    { "code": "ko", "name": "韩语", "nativeName": "Korean" },
    { "code": "es", "name": "西班牙语", "nativeName": "Spanish" },
    { "code": "fr", "name": "法语", "nativeName": "French" },
    { "code": "de", "name": "德语", "nativeName": "German" },
    { "code": "pt", "name": "葡萄牙语", "nativeName": "Portuguese" },
    { "code": "ru", "name": "俄语", "nativeName": "Russian" }
  ]
}
```

---

### 5.2 支持的 AI 模型列表

```
GET /api/constants/models
```

**响应示例**:
```json
{
  "models": [
    {
      "id": "anthropic/claude-3.5-sonnet",
      "name": "Claude 3.5 Sonnet",
      "provider": "Anthropic",
      "recommended": true
    },
    {
      "id": "openai/gpt-4o",
      "name": "GPT-4o",
      "provider": "OpenAI",
      "recommended": true
    },
    {
      "id": "google/gemini-pro-1.5",
      "name": "Gemini Pro 1.5",
      "provider": "Google",
      "recommended": false
    }
  ]
}
```

---

## 6. 通用错误响应

所有接口可能返回的错误格式:

```json
{
  "error": "错误描述信息"
}
```

**常见状态码**:
- `401`: 未授权 (需要登录)
- `403`: 禁止访问 (权限不足)
- `404`: 资源不存在
- `429`: 请求过于频繁 (限流)
- `500`: 服务器内部错误

---

## 7. 认证说明

所有 API 接口 (除了认证接口) 都需要用户登录状态。

**前端需要**:
1. 使用 NextAuth.js 的 `useSession()` Hook 获取会话
2. 请求时自动携带 Session Cookie
3. 如果返回 `401`,重定向到登录页面

---

## 8. 限流规则

**免费用户限制**:
- 每日翻译任务数: 10 次
- 每次最多翻译文件数: 5 个
- 每个文件最大字符数: 50,000

**自带 API Key 用户**:
- 无平台限制,仅受 OpenRouter 限制
