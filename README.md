# CeramicCraft 用户端

## 技术栈

- Vue 3 + TypeScript + Vite
- Vue Router
- Element Plus
- Sass

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run type-check
```

## 项目结构

```
src/
├── components/     # 公共组件
├── views/         # 页面
│   ├── Home.vue   # 首页
│   └── Login.vue  # 登录注册
├── layouts/       # 布局组件
├── router/        # 路由
├── types/         # TypeScript 类型定义
├── assets/        # 静态资源
└── main.ts        # 入口文件
```

## 代码规范

### 命名规范
- 组件文件：`PascalCase.vue`
- TypeScript 文件：`camelCase.ts`
- 类型定义：`PascalCase`
- 变量/函数：`camelCase`
- CSS类名：`kebab-case`

### Vue 组件结构
```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
// TypeScript 逻辑
</script>

<style scoped>
/* 样式 */
</style>
```

### TypeScript 规范
```typescript
// 接口定义
interface User {
  id: number
  name: string
  email: string
}

// 函数类型注解
function getUser(id: number): Promise<User> {
  // 实现逻辑
}

// Props 类型定义
interface Props {
  user: User
  showDetails?: boolean
}
```

## 注释规范

```typescript
/**
 * 获取用户信息
 * @param id - 用户ID
 * @returns 用户信息对象
 */
async function getUser(id: number): Promise<User> {
  // 实现逻辑
}
```

```vue
<template>
  <!-- 重要区域注释 -->
  <div class="user-info">
    <!-- 用户头像 -->
    <img :src="avatar" alt="头像" />
  </div>
</template>

<script setup lang="ts">
// Props 类型定义
interface Props {
  /** 用户头像地址 */
  avatar: string
}
</script>
```

## 开发规范

### Git 提交规范

使用约定式提交格式：`type(scope): description [KAN-xxx]`

**类型 (type)**：

- `feat`: 新功能
- `fix`: 修复问题
- `refactor`: 重构代码
- `style`: 代码格式调整
- `docs`: 文档更新
- `test`: 测试相关
- `chore`: 构建或辅助工具变动

**示例**：

```bash
feat(auth): add user login functionality [KAN-123]
fix(cart): resolve product quantity update issue [KAN-124]
refactor(routing): implement customer route prefix system [KAN-125]
```

### 分支管理

- `main`: 主分支，保持稳定
- `develop`: 开发分支
- `feature/KAN-xxx-description`: 功能分支
- `hotfix/KAN-xxx-description`: 紧急修复分支

### Pull Request 规范

**PR 标题格式**：`[KAN-xxx] Brief description`

**PR 描述模板**：

```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新

## 变更描述
简要描述此次变更的内容和原因

## 测试确认
- [ ] 本地开发环境测试通过
- [ ] 代码审查通过
- [ ] 相关测试用例更新

## 关联 Jira
KAN-xxx: [链接到 Jira ticket]
```

### 代码审查 (Code Review)

**审查重点**：

1. 代码逻辑正确性
2. TypeScript 类型安全
3. Vue 组件设计合理性
4. 性能考虑
5. 安全性检查

**审查流程**：

1. 自测通过后提交 PR
2. 至少一人审查通过
3. CI/CD 检查通过
4. 合并到目标分支

### 项目管理工具

- **Jira**: [项目看板链接](https://ceramicraft.atlassian.net/jira/software/projects/KAN/boards/1)
- **Confluence**: [项目文档](https://ceramicraft.atlassian.net/wiki/spaces/CC/overview)

### 后端协作规范

**API 对接**：

1. 后端提供 API 文档（Swagger/OpenAPI）
2. 前端基于文档创建 TypeScript 类型定义
3. Mock 数据用于并行开发
4. 集成测试确保接口正确性

**数据格式约定**：

```typescript
// 统一的 API 响应格式
interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页数据格式
interface PageData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
```

### 环境配置

**开发环境**：

- Node.js >= 18.0.0
- npm >= 8.0.0
- VS Code + Vue 官方扩展

**代码质量工具**：

- ESLint: 代码规范检查
- Prettier: 代码格式化
- TypeScript: 类型检查
- Husky: Git hooks

### 部署流程

1. **开发环境**: 本地开发服务器
2. **测试环境**: CI/CD 自动部署到测试服务器
3. **生产环境**: 手动触发生产部署

### 故障处理

**问题上报流程**：

1. 在 Jira 创建 Bug ticket
2. 详细描述问题现象和复现步骤
3. 标记优先级和影响范围
4. 分配给相应开发人员

**紧急修复流程**：

1. 创建 hotfix 分支
2. 快速修复并测试
3. 直接合并到 main 分支
4. 部署到生产环境
5. 事后补充完整测试
