# 🐍 python-learn | Python Interactive Code Laboratory

[![Version](https://img.shields.io/badge/version-1.0.0-3776ab.svg?style=flat-square)](https://github.com/pursuing-coding/python-learn/releases/tag/v1.0.0)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Mobile-ffd43b.svg?style=flat-square)](#)
[![Tests Status](https://img.shields.io/badge/tests-20%2F20%20passed-16a34a.svg?style=flat-square)](#)

面向 Python 从入门到进阶学习的**现代化浏览器课程实验室**。界面采用 **Azure-Amber（湖蓝-琥珀）** 专业配色与响应式玻璃摩登设计，集成课程阅读、代码编辑、实时运行、测试用例验证与进度追踪于一体的轻量级实验室系统。

🔗 **[在线立即体验实验室 🚀](https://pursuing-coding.github.io/python-learn/)**  
🔗 **[GitHub 仓库源码](https://github.com/pursuing-coding/python-learn)**

---

## ✨ 核心亮点

* 🎨 **Azure-Amber 摩登美学**
  * 取自 Python 官方视觉的湖蓝 + 琥珀双色系，支持全局一键日夜模式平滑切换。
  * 优雅的微交互效果（卡片浮起、按钮渐变缩放、加载态发光过渡）。
  * 极致响应式视口布局（桌面端三栏、移动端紧凑布局，无水平溢出滚动条）。
* 📝 **实时实战进度清单**（本系列独有，随键入即时判定）
  * 每章配备三步实战清单——「动手修改初始代码 → 通过第一个测试用例 → 通过本章全部测试」，系统随代码编辑与测试结果**逐键实时打勾**，蓝金渐变对勾圆环即时反馈学习成就。
* 🔍 **零依赖 Python 语法高亮引擎**
  * 自主设计的正则词法解析引擎，无需外部库即可精准着色关键字、内建函数、装饰器、字符串、注释与数字。
* ⚙️ **双轨代码执行通道**
  * **本地模式**：优先由本地的 `python` / `python3` 解释器在隔离目录中执行（支持标准输入输出）。
  * **云端模式**：当本地未安装解释器或发布为静态 Pages 时，自动回退到公开 Judge0 API（Python 3）完成远程安全容器化运行。
* 💾 **草稿与进度安全隔离**
  * 代码草稿在本地自动持久化；标准输入（`stdin`）仅存在于内存，不写入本地缓存，保护隐私与代码干净度。

---

## 🗂️ 课程大纲 (13 个精选章节)

| 章节 | 课题 | 核心学习目标 |
| :--- | :--- | :--- |
| **01** | 解释执行模型与第一个程序 | 理解解释器/字节码，使用 `print()` 输出 |
| **02** | 变量、动态类型与内建类型 | 动态类型绑定、`type()` 与多参数打印 |
| **03** | 流程控制与函数 | `def` 定义函数、`for`/`range` 循环、`return` |
| **04** | 序列容器：列表与元组 | `append`、切片、`len()` |
| **05** | 字典与集合 | 键值映射、`items()` 遍历、集合去重 |
| **06** | 字符串处理与格式化 | 字符串方法、f-string、`split()` |
| **07** | 推导式与生成器 | 列表推导、条件过滤、生成器表达式 |
| **08** | 函数进阶：参数、lambda 与高阶函数 | `*args`、`lambda`、`sorted(key=...)` |
| **09** | 面向对象：类与实例 | `class`、`__init__`、`self`、方法 |
| **10** | 继承、多态与魔术方法 | 继承重写、多态派发、`__str__` |
| **11** | 异常处理与健壮性 | `try/except`、回退值、`is None` 分支 |
| **12** | 模块、装饰器与迭代 | `import`、装饰器包裹、`func.__name__` |
| **13** | 综合实战：词频统计 | 字典累计、多关键字排序、格式化输出 |

---

## 🛠️ 本地开发与部署

### 1. 克隆并安装依赖
```bash
git clone https://github.com/pursuing-coding/python-learn.git
cd python-learn
npm install
```

### 2. 启动本地开发服务
```bash
npm start
```
* 服务启动后运行在：`http://localhost:4173`
* 本地运行需要 `python` 或 `python3` 在环境变量中以启用本地执行。若未安装解释器，服务将以“有限教学预览模式”运行（可查阅全部教程并编辑代码，`print("...")` 会做简易模拟输出）。

---

## 🚦 单元与 E2E 冒烟测试

```bash
npm run verify
```

该校验将自动执行：
1. **课程配置校验** (`scripts/validate-lessons.js`)：检测静态资源链接、字段完整性、初始/参考代码与测试用例的逻辑完整性；当本机存在 Python 解释器时，还会**真实执行全部参考答案**并逐一比对 19 个用例的期望输出。
2. **多终端 UI 冒烟测试** (`tests/ui-smoke.spec.js`)：通过 Playwright 启动 Headless Chromium，覆盖桌面端与移动端的进度存储、草稿恢复、专注模式、测试用例切换、面板溢出等关键交互场景。

> 💡 若本机安全策略禁止运行 Playwright 下载的 Chromium，可改用系统浏览器执行测试：`PLAYWRIGHT_CHANNEL=chrome npm run smoke:ui`（PowerShell 下先 `$env:PLAYWRIGHT_CHANNEL="chrome"`）。

---

## 📂 项目结构指南

```text
├── .github/workflows/   # GitHub Actions (校验与 Pages 自动化发布)
├── public/
│   ├── index.html       # 实验室静态页面主入口
│   ├── app.js           # UI 逻辑、Python 高亮引擎、测试执行器、进度管理器
│   ├── course-data.js   # 13 章核心课程数据
│   ├── styles.css       # 响应式 UI 样式与 Azure-Amber 视觉系统
│   └── favicon.svg      # 项目徽标
├── scripts/
│   └── validate-lessons.js # 自动化关卡校验脚本
├── tests/
│   └── ui-smoke.spec.js # Playwright UI 冒烟测试脚本
├── server.js            # 本地 Python 执行 API 与静态服务器
├── package.json         # 项目元数据与脚本配置
└── playwright.config.js # Playwright 测试框架配置
```

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 协议开源。
