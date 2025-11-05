# CeramiCraft 客户端前端

[ [English](./README.md) | 简体中文 ]

## 📖 项目简介

CeramiCraft 是一个专业的手工陶艺品电商平台的客户端应用。本项目采用现代化的前端技术栈构建，为用户提供流畅的购物体验，包括商品浏览、购物车管理、订单处理、评价系统等完整的电商功能。

### ✨ 主要特性

- 🛍️ **商品展示** - 精美的商品列表和详情页面
- 🛒 **购物车管理** - 实时购物车同步和价格计算
- 💳 **订单处理** - 完整的下单、支付、订单追踪流程
- 👤 **用户中心** - 个人信息管理、地址管理、余额充值
- ⭐ **评价系统** - 订单评价和历史评价查看
- 📱 **响应式设计** - 适配多种设备屏幕
- 🔐 **安全认证** - JWT Token 认证和权限管理

## 🛠️ 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 7.1.2
- **语言**: TypeScript 5.8.3
- **路由**: Vue Router 4.5.1
- **UI 组件库**: Element Plus 2.11.2
- **HTTP 客户端**: Axios 1.12.0
- **图标**: Font Awesome 7.0.1
- **代码规范**: ESLint 9.35.0
- **测试**: Vitest 3.2.4 + Vue Test Utils

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动，并自动代理 API 请求到后端服务器。

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

预览服务将在 `http://localhost:4173` 启动。

### 代码检查

```bash
npm run lint
```

## 🐳 Docker 部署

### 构建 Docker 镜像

```bash
# 使用提供的脚本
./build_dkimg.sh

# 或手动构建
docker build -t ceramicraft-customer-frontend .
```

### 运行容器

```bash
docker run -p 8080:8080 ceramicraft-customer-frontend
```

应用将在 `http://localhost:8080` 可访问。

## 🔧 配置说明

### API 配置

API 端点配置位于 `src/config/api-endpoints.ts`，包含以下微服务：

- **用户服务** (`user-ms`): 用户认证、注册、个人信息管理
- **商品服务** (`product-ms`): 商品展示、购物车管理
- **支付服务** (`payment-ms`): 订单处理、支付账户管理

### 环境变量

开发环境通过 Vite 代理配置（`vite.config.ts`）处理 API 请求：

```typescript
proxy: {
  '/api': {
    target: 'http://47.129.72.211',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  }
}
```

生产环境直接使用配置的后端域名。

## 📱 主要功能模块

### 1. 用户认证
- 用户注册（邮箱验证）
- 登录/登出
- 密码管理

### 2. 商品浏览
- 商品列表展示
- 商品搜索和筛选
- 商品详情查看
- 商品图片预览

### 3. 购物车
- 添加商品到购物车
- 修改商品数量
- 删除购物车商品
- 实时价格计算

### 4. 订单管理
- 创建订单
- 选择收货地址
- 订单支付
- 查看订单列表
- 订单详情查看
- 订单状态追踪

### 5. 用户中心
- 个人信息管理
- 收货地址管理
- 支付账户余额查看
- 账户充值
- 修改密码

### 6. 评价系统
- 订单评价
- 历史评价查看
- 评价管理

## 🎨 UI 组件库

项目使用 Element Plus 作为 UI 组件库，主要使用的组件包括：

- **导航**: Menu, Breadcrumb
- **表单**: Form, Input, Select, DatePicker
- **数据展示**: Table, Card, Tag, Avatar
- **反馈**: Message, Dialog, Loading, Notification
- **布局**: Container, Row, Col

## 🔐 权限控制

通过路由守卫实现权限控制：

```typescript
meta: { requiresAuth: true }  // 需要登录才能访问
```

需要认证的页面包括：
- 个人中心
- 购物车
- 结算页面
- 订单管理
- 我的评价

## 📝 开发规范

### 代码风格

- 使用 TypeScript 进行类型约束
- 遵循 ESLint 规则
- 使用 Composition API 编写组件
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

### Git 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链更新
```

## 🧪 测试

```bash
# 运行测试
npm run test

# 运行测试并查看覆盖率
npm run test:coverage
```

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请联系开发团队。

---

**CeramiCraft** - 让手工艺术走进生活 🎨
