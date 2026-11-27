# 🐍 python-learn | Python Interactive Code Laboratory

[![Version](https://img.shields.io/badge/version-1.0.0-3776ab.svg?style=flat-square)](https://github.com/pursuing-coding/python-learn/releases/tag/v1.0.0)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Mobile-ffd43b.svg?style=flat-square)](#)

从第一个 `print()` 学到用命令解析、文件与测试完成小项目。课程共 33 章，配有 67 个可运行用例，可在浏览器里写代码、验证输出并保存学习进度。

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
  * **本地模式**：通过本机 Python 3.8+ 解释器在临时工作目录中执行，支持标准输入输出。
  * **在线模式**：静态 Pages 使用 Judge0。本机开发时可手动选择「在线 Judge0」，此模式会将源码和标准输入发送给 Judge0。
* 💾 **草稿与进度安全隔离**
  * 代码草稿和当前章节在本地自动保存。标准输入（`stdin`）只在当前页面保留。

---

## 🗂️ 课程大纲 (33 章 · 5 个 Level · 从小白到独立开发)

课程内容以 [Python 官方教程](https://docs.python.org/zh-cn/3/tutorial/index.html)与[标准库参考](https://docs.python.org/zh-cn/3/library/index.html)为蓝本编写，每章底部附对应官方文档链接；全部示例兼容 Python 3.8+（云端运行器版本）。

### Level 1 · 语言基础 (Foundation)

| 章节 | 课题 | 核心学习目标 |
| :--- | :--- | :--- |
| **01** | 写下第一个 Python 程序 | 用 `print()` 输出文字，运行并验证练习 |
| **02** | 变量、动态类型与内建类型 | 动态类型绑定、`type()` 与多参数打印 |
| **03** | 数字与运算符 | `/` 真除与 `//` 整除、`%`、`**`、`int(input())` |
| **04** | 字符串入门：索引、切片与转义 | 下标/负数下标、切片、`len()`、`in`、转义字符 |
| **05** | 条件分支：if / elif / else | 多路分支、比较与逻辑运算符、真值检测 |
| **06** | while 循环与 break / continue | 条件循环、循环变量更新、逐位拆解整数 |
| **07** | for 循环、range 与嵌套循环 | `range` 三形态、嵌套循环、`join` 拼行 |
| **08** | 函数：定义、参数与返回值 | `def`/`return`、默认参数、docstring |

### Level 2 · 数据结构与核心 (Core)

| 章节 | 课题 | 核心学习目标 |
| :--- | :--- | :--- |
| **09** | 序列容器：列表与元组 | `append`、切片、别名陷阱与复制 |
| **10** | 字典与集合 | 键值映射、`items()` 遍历、集合去重与运算 |
| **11** | 字符串方法与 f-string 格式化 | 字符串方法、f-string 与格式说明、`split()` |
| **12** | 推导式与生成器 | 列表推导、条件过滤、生成器表达式 |
| **13** | 内建函数工具箱 | `enumerate`、`zip`、`max`/`sorted` 聚合 |
| **14** | 函数进阶：*args、lambda 与高阶函数 | `*args`、`lambda`、`sorted(key=...)` |
| **15** | 作用域、闭包与递归 | LEGB、`nonlocal` 闭包计数器、递归终止条件 |

### Level 3 · 面向对象与模块 (Object)

| 章节 | 课题 | 核心学习目标 |
| :--- | :--- | :--- |
| **16** | 异常处理与健壮性 | `try/except`、回退值、`is None` 分支 |
| **17** | 主动抛出异常与自定义异常类 | `raise`、继承 `Exception`、`except ... as` |
| **18** | 面向对象：类与实例 | `class`、`__init__`、`self`、方法 |
| **19** | 继承、多态与魔术方法 | 继承重写、多态派发、`__str__` |
| **20** | dataclass 与对象组合 | `@dataclass`、`default_factory`、组合建模 |
| **21** | 模块与标准库导航 | `import` 两种形式、`math`/`random`、查文档 |
| **22** | 装饰器：包装函数的函数 | 装饰器原理、`@` 语法糖、`functools.wraps` |

### Level 4 · 标准库实战 (Stdlib)

| 章节 | 课题 | 核心学习目标 |
| :--- | :--- | :--- |
| **23** | 类型注解与代码可读性 | 参数/返回值注解、`Optional`、静态检查思维 |
| **24** | 文件读写与 pathlib | `Path` 读写、`encoding="utf-8"`、`with open` |
| **25** | JSON 与数据序列化 | `dumps`/`loads`、`ensure_ascii=False`、类型映射 |
| **26** | 日期与时间：datetime 模块 | `date`/`datetime`、`timedelta` 运算、`strftime` |
| **27** | 正则表达式：re 模块 | 元字符、捕获组、`findall`/`search`/`sub` |
| **28** | 效率工具箱：collections 与 itertools | `Counter`、`defaultdict`、`product` |
| **29** | 测试思维：assert 与自检代码 | `assert` 断言、边界用例、回归测试意识 |

### Level 5 · 综合项目 (Capstone)

| 章节 | 课题 | 核心学习目标 |
| :--- | :--- | :--- |
| **30** | 综合实战一：词频统计 | 字典累计、多关键字排序、格式化输出 |
| **31** | 综合实战二：命令驱动的待办清单 | 命令解析、状态维护、清单渲染 |
| **32** | 综合实战三：学生成绩分析器 | 记录解析、统计聚合、排行输出 |
| **33** | 毕业项目：银行账户系统 | 类封装 + 自定义异常 + 命令循环的完整小系统 |

### 下载待办清单项目

[下载 ZIP](public/downloads/python-todo-cli.zip)。解压后在项目目录执行 `python3 todo.py add "复习 Python"`，再用 `python3 todo.py list` 查看结果。需要 Python 3.8 或更新版本，使用标准库即可。压缩包里有运行说明和测试。

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
* 本地运行要求 `PATH` 中有 Python 3.8 或更高版本。未安装时可编辑代码并预览简单的 `print("...")`。验证和解锁课程需要 Python 解释器或手动选择「在线 Judge0」。
* 本地运行服务使用启动服务的账户权限。请保持默认的本机监听，仅运行信任的代码。
* 编辑器中，Tab 缩进，Shift+Tab 减少缩进。按 Esc 后再按 Tab 或 Shift+Tab 可移出编辑器。专注模式可按 Esc 返回。按 F6 可在代码与标准输入之间切换。
* 判题比较标准输出，允许固定文本末尾有一个换行，保留空格、空行等其余格式。发生错误时，可从控制台跳到代码行。
* 同一章在多个标签页编辑时，会保留可载入的草稿副本。浏览器无法写入共享草稿时，可下载当前代码。

---

## 🚦 单元与 E2E 冒烟测试

```bash
npm run verify
```

该校验将自动执行：
1. **课程和下载项目**。验证 67 个样例，并从发布用的 ZIP 解压运行实战项目测试。
2. **判题和本地服务**。验证输出比较、错误定位和本地运行接口。
3. **Safari 回归**。验证运行、提交、草稿和布局，其中包含通过本地 HTTP 服务执行 Python 的用例。

更新项目源码后，用 `python3 scripts/package-project.py` 重新生成下载包。


---

## 📂 项目结构指南

```text
├── .github/workflows/   # GitHub Actions (校验与 Pages 自动化发布)
├── public/
│   ├── index.html       # 实验室静态页面主入口
│   ├── app.js           # UI 逻辑、Python 高亮引擎、测试执行器、进度管理器
│   ├── course-data.js   # 33 章核心课程数据（5 个 Level）
│   ├── styles.css       # 响应式 UI 样式与 Azure-Amber 视觉系统
│   └── favicon.svg      # 项目徽标
├── scripts/
│   └── validate-lessons.js # 自动化关卡校验脚本
├── tests/
│   └── native-ui.js # Safari UI 冒烟测试脚本
├── server.js            # 本地 Python 执行 API 与静态服务器
├── package.json         # 项目元数据与脚本配置
```

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 协议开源。

浏览器回归在 macOS 上使用系统 Safari。开启 Safari 开发者设置中的「允许远程自动化」后运行 `npm run verify`。三个窗口尺寸共用一个 WebDriver 会话，每个用例单独清理练习数据。

如果 Safari 27 创建会话超时，且系统日志显示 `Safari was not launched for automation`，保存浏览器中的工作，用 ⌘Q 正常退出 Safari，再运行验证命令。SafariDriver 会自行启动自动化窗口。测试结束后可照常打开 Safari。
