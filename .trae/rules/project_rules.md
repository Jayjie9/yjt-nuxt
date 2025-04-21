---
name: Nuxt.js 开发规范
description: Nuxt.js 项目最佳实践和编码标准
---

# 项目规则

## 技术栈要求

- 开发人员需要精通以下技术：TypeScript、Node.js、NuxtJS、Vue 3、Shadcn Vue、Radix Vue、VueUse 和 Tailwind。

## 代码风格和结构

- 编写简洁、专业的 TypeScript 代码，提供准确的示例
- 使用组合式 API 和声明式编程模式，避免选项式 API
- 优先考虑迭代和模块化，避免代码重复
- 使用描述性的变量名称，配合助动词（如：isLoading、hasError）
- 文件结构遵循：导出组件、组合式函数、辅助函数、静态内容、类型定义的顺序

## 命名规范

- 目录使用小写字母配合连字符（例如：components/auth-wizard）
- 组件名称使用大驼峰命名法（例如：AuthWizard.vue）
- 组合式函数使用小驼峰命名法（例如：useAuthState.ts）

## TypeScript 使用规范

- 所有代码都使用 TypeScript，优先使用类型而非接口
- 避免使用枚举，改用常量对象
- 使用 Vue 3 配合 TypeScript，充分利用 defineComponent 和 PropType

## 【后添加】安全规范

- 实现 XSS 防御措施
- 添加 CSRF 令牌验证
- 敏感数据传输必须加密
- 实现请求频率限制
- 定期更新依赖包，修复安全漏洞

## 语法和格式规范

- 方法和计算属性使用箭头函数
- 条件语句中避免不必要的大括号，简单语句使用简洁语法
- 使用模板语法进行声明式渲染

## UI 和样式规范

- 使用 Shadcn Vue、Radix Vue 和 Tailwind 进行组件开发和样式设计
- 使用 Tailwind CSS 实现响应式设计，采用移动端优先的方案

## 【后添加】组件设计规范

- 遵循单一职责原则
- 组件粒度适中，避免过大或过小
- 实现组件的 Props 类型检查
- 提供完整的组件文档
- 编写组件单元测试用例

## 性能优化规范

- 充分利用 Nuxt 内置的性能优化特性
- 使用 Suspense 处理异步组件
- 实现路由和组件的懒加载
- 图片优化：使用 WebP 格式、包含尺寸数据、实现懒加载

## 核心开发规范

- 使用 VueUse 实现常用的组合式函数和工具函数
- 使用 Pinia 进行状态管理
- 优化核心 Web 指标（LCP、CLS、FID）
- 充分利用 Nuxt 的自动导入特性处理组件和组合式函数

## Nuxt 特定指南

- 遵循 Nuxt 3 的目录结构（如：pages/、components/、composables/）
- 使用 Nuxt 内置功能：
  - 组件和组合式函数的自动导入
  - pages/ 目录中的基于文件的路由
  - server/ 目录中的服务器路由
- 利用 Nuxt 插件实现全局功能
- 使用 useFetch 和 useAsyncData 进行数据获取
- 使用 Nuxt 的 useHead 和 useSeoMeta 实现 SEO 最佳实践

## Vue 3 和组合式 API 最佳实践

- 使用 <script setup> 语法实现简洁的组件定义
- 使用 ref、reactive 和 computed 进行响应式状态管理
- 适当使用 provide/inject 进行依赖注入
- 实现自定义组合式函数以复用逻辑

## 代码审查清单

- 检查代码是否符合项目规范
- 验证功能是否完整实现
- 确认测试用例是否完备
- 审查性能优化措施
- 检查安全漏洞修复情况

## 代码注释规范

- 组件顶部必须包含功能说明、作者和创建时间
- 复杂的业务逻辑必须添加详细的中文注释
- API 接口必须注明参数类型、返回值和用途
- 重要的状态变量需要添加用途说明
- Git commit 信息需要符合约定式提交规范

## 错误处理规范

- 统一使用 try-catch 进行错误捕获
- 实现全局错误处理中间件
- 区分业务错误和系统错误
- 统一错误日志记录格式
- 提供友好的错误提示界面

## 开发参考

请遵循 Nuxt.js 和 Vue.js 官方文档中关于数据获取、渲染和路由的最新最佳实践。
