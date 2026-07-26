// Python interactive course catalog for python-learn (13 lessons).
window.PY_LESSONS = [
  {
    id: 1,
    title: 'Python 解释执行模型与第一个程序',
    difficulty: '基础',
    estimatedMinutes: 8,
    goals: ['理解 Python 的解释执行模型', '使用 print() 向标准输出打印文本', '用 # 编写单行注释'],
    hint: '直接调用内建函数 print()，把要输出的字符串放进英文双引号里即可。',
    expectedOutput: 'Hello, Python World!',
    tutorial: `# 第 1 章：解释执行模型与第一个程序 🐍

Python 是一门**解释型**、**动态类型**的高级语言。它由 CPython 解释器逐行读取源码：先把 \`.py\` 源文件编译成字节码（\`.pyc\`），再交由虚拟机执行，因此无需像 C++ 那样手动编译链接。

### 核心要素

- \`print(...)\`：内建函数，把内容写入标准输出，末尾默认自动换行。
- 字符串字面量：用一对引号包裹，\`"..."\` 与 \`'...'\` 等价。
- 注释：以 \`#\` 开头，直到行尾都会被解释器忽略。

### 实战挑战

补全右侧代码，让程序输出下面这一行：
\`\`\`python
print("Hello, Python World!")
\`\`\``,
    starterCode: `# TODO: 输出 Hello, Python World!
`,
    answerCode: `print("Hello, Python World!")
`,
  },
  {
    id: 2,
    title: '变量、动态类型与内建类型',
    difficulty: '基础',
    estimatedMinutes: 10,
    goals: ['为变量赋值并读取', '用 type() 查看对象类型', '用 print 的多参数形式格式化输出'],
    hint: '给 name 赋字符串、给 age 赋整数，再用 print("标签", 值) 的形式逐行输出，注意 type(age) 会打印 <class \'int\'>。',
    expectedOutput: 'name = Ada\nage = 18\ntype(age) = <class \'int\'>',
    tutorial: `# 第 2 章：变量、动态类型与内建类型 🧩

在 Python 中，变量只是指向对象的**名字**，无需事先声明类型。赋值语句 \`x = 值\` 会让名字 \`x\` 绑定到右侧对象上，类型由对象本身决定，这就是**动态类型**。

### 常见内建类型

- \`int\`：整数，例如 \`18\`。
- \`float\`：浮点数，例如 \`96.5\`。
- \`str\`：字符串，例如 \`"Ada"\`。
- \`bool\`：布尔值 \`True\` / \`False\`。

用内建函数 \`type(对象)\` 可以查看其类型对象，例如 \`type(18)\` 会得到 \`<class 'int'>\`。

### print 的多参数

\`print(a, b, c)\` 会用空格把多个值拼接后输出，非常适合打印“标签 + 值”。

### 实战挑战

把 \`name\` 赋值为 \`"Ada"\`、\`age\` 赋值为 \`18\`，然后依次输出：
\`\`\`text
name = Ada
age = 18
type(age) = <class 'int'>
\`\`\``,
    starterCode: `name = ""
age = 0

# TODO: 按要求输出 name、age 以及 age 的类型
`,
    answerCode: `name = "Ada"
age = 18

print("name =", name)
print("age =", age)
print("type(age) =", type(age))
`,
  },
  {
    id: 3,
    title: '流程控制与函数',
    difficulty: '基础',
    estimatedMinutes: 12,
    goals: ['用 def 定义带参数的函数', '用 for + range 实现累加循环', '通过 return 返回计算结果'],
    hint: '定义 sum_to(n)，用 for i in range(1, n + 1) 把 1 到 n 累加；从标准输入读入 n 时记得用 int() 转换。',
    expectedOutput: '55',
    defaultStdin: '10',
    testCases: [
      { id: 'sum-10', title: 'n = 10', stdin: '10', expectedOutput: '55' },
      { id: 'sum-5', title: 'n = 5', stdin: '5', expectedOutput: '15' },
      { id: 'sum-zero', title: 'n = 0', stdin: '0', expectedOutput: '0', note: '边界示例：n 为 0 时结果应为 0。' },
    ],
    tutorial: `# 第 3 章：流程控制与函数 🔁

函数是可复用的代码块，用 \`def\` 关键字定义。Python **用缩进（通常 4 个空格）划分代码块**，函数体、循环体都要缩进。

### 定义与调用

\`\`\`python
def sum_to(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
\`\`\`

- \`range(1, n + 1)\` 生成 1、2、…、n 这一串整数（右端点不包含）。
- \`total += i\` 等价于 \`total = total + i\`。
- \`return\` 把结果交回给调用方；当 \`n\` 为 0 时循环不执行，直接返回 0。

### 读取标准输入

\`input()\` 读入一行文本（字符串），要参与数值运算需用 \`int()\` 转成整数。

### 实战挑战

从标准输入读入整数 \`n\`，输出 \`1 + 2 + ... + n\` 的和。\`n = 10\` 时应输出 \`55\`。`,
    starterCode: `def sum_to(n):
    # TODO: 累加 1 到 n 并返回结果
    return 0

n = int(input())
print(sum_to(n))
`,
    answerCode: `def sum_to(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total

n = int(input())
print(sum_to(n))
`,
  },
  {
    id: 4,
    title: '序列容器：列表与元组',
    difficulty: '基础',
    estimatedMinutes: 12,
    goals: ['创建列表并用 append 追加元素', '使用切片截取子序列', '用 len() 获取序列长度'],
    hint: '先构造 [10, 20, 30]，append(40)，再用 nums[:2] 取前两个元素，最后用 len(nums) 输出长度。',
    expectedOutput: '[10, 20, 30, 40]\nfirst two: [10, 20]\nlength: 4',
    tutorial: `# 第 4 章：序列容器 — 列表与元组 📦

**列表（list）** 是可变的有序序列，用方括号 \`[]\` 表示；**元组（tuple）** 是不可变的有序序列，用圆括号 \`()\` 表示。

### 常用操作

- 追加：\`nums.append(40)\` 在末尾加入元素。
- 索引：\`nums[0]\` 取第一个，\`nums[-1]\` 取最后一个。
- 切片：\`nums[:2]\` 取前两个，\`nums[1:3]\` 取下标 1、2。
- 长度：\`len(nums)\` 返回元素个数。

切片会返回一个**新的列表**，不会修改原列表。

### 实战挑战

构造列表 \`[10, 20, 30]\`，追加 \`40\`，然后输出：
\`\`\`text
[10, 20, 30, 40]
first two: [10, 20]
length: 4
\`\`\``,
    starterCode: `nums = [10, 20, 30]

# TODO: 追加 40，并按要求输出列表、前两个元素与长度
`,
    answerCode: `nums = [10, 20, 30]
nums.append(40)

print(nums)
print("first two:", nums[:2])
print("length:", len(nums))
`,
  },
  {
    id: 5,
    title: '字典与集合',
    difficulty: '进阶',
    estimatedMinutes: 12,
    goals: ['用字典存储键值对并遍历 items()', '理解字典保持插入顺序', '用集合去重并统计数量'],
    hint: '用 for key, value in counts.items() 遍历字典逐行输出；集合 {..} 会自动去重，用 len() 统计唯一元素。',
    expectedOutput: 'apple -> 3\nbanana -> 2\nunique: 3',
    tutorial: `# 第 5 章：字典与集合 🗂️

**字典（dict）** 存储“键 → 值”的映射，用 \`{}\` 定义。从 Python 3.7 起，字典会**保持插入顺序**。

### 字典遍历

\`\`\`python
counts = {"apple": 3, "banana": 2}
for key, value in counts.items():
    print(key, "->", value)
\`\`\`

- \`counts.items()\` 返回“键值对”的可迭代视图。
- \`counts["apple"]\` 按键取值；\`counts.get(k, 0)\` 在键不存在时返回默认值。

### 集合去重

**集合（set）** 是无序且元素唯一的容器。把带重复的数据放入集合即可去重，\`len(集合)\` 得到唯一元素个数。

### 实战挑战

遍历字典 \`{"apple": 3, "banana": 2}\` 输出每一项，再用集合统计 \`{"apple", "banana", "apple", "cherry"}\` 的唯一数量：
\`\`\`text
apple -> 3
banana -> 2
unique: 3
\`\`\``,
    starterCode: `counts = {"apple": 3, "banana": 2}

# TODO: 遍历字典输出每一项

fruits = {"apple", "banana", "apple", "cherry"}
# TODO: 输出 unique 数量
`,
    answerCode: `counts = {"apple": 3, "banana": 2}
for key, value in counts.items():
    print(key, "->", value)

fruits = {"apple", "banana", "apple", "cherry"}
print("unique:", len(fruits))
`,
  },
  {
    id: 6,
    title: '字符串处理与格式化',
    difficulty: '进阶',
    estimatedMinutes: 12,
    goals: ['调用字符串方法如 upper()、split()', '使用 f-string 插值格式化', '统计一句话中的单词数'],
    hint: 'text.upper() 转大写；f"Hi, {name}!" 可把变量嵌入字符串；sentence.split() 按空白切分成单词列表，再用 len() 计数。',
    expectedOutput: 'HELLO\nHi, Ada! You are 18.\nwords: 3',
    tutorial: `# 第 6 章：字符串处理与格式化 ✂️

字符串是不可变序列，但提供了大量返回**新字符串**的方法。

### 常用方法

- \`text.upper()\` / \`text.lower()\`：大小写转换。
- \`text.strip()\`：去掉首尾空白。
- \`sentence.split()\`：按空白拆分成单词列表。
- \`",".join(items)\`：用分隔符把列表拼成字符串。

### f-string 格式化

在字符串前加 \`f\`，即可用 \`{表达式}\` 直接插值：
\`\`\`python
name = "Ada"
age = 18
print(f"Hi, {name}! You are {age}.")
\`\`\`

### 实战挑战

依次输出 \`"hello"\` 的大写、一句 f-string 问候，以及 \`"learn python now"\` 的单词数：
\`\`\`text
HELLO
Hi, Ada! You are 18.
words: 3
\`\`\``,
    starterCode: `text = "hello"
name = "Ada"
age = 18
sentence = "learn python now"

# TODO: 依次输出大写文本、f-string 问候、单词数量
`,
    answerCode: `text = "hello"
name = "Ada"
age = 18
sentence = "learn python now"

print(text.upper())
print(f"Hi, {name}! You are {age}.")
print("words:", len(sentence.split()))
`,
  },
  {
    id: 7,
    title: '推导式与生成器',
    difficulty: '进阶',
    estimatedMinutes: 12,
    goals: ['用列表推导式生成序列', '在推导式中加入 if 过滤条件', '用生成器表达式配合 sum() 求和'],
    hint: '[x * x for x in range(1, 6)] 生成平方；加 if x % 2 == 0 做过滤；sum(x * x for x in range(1, 6)) 直接求平方和。',
    expectedOutput: '[1, 4, 9, 16, 25]\nevens: [2, 4, 6, 8, 10]\nsum of squares: 55',
    tutorial: `# 第 7 章：推导式与生成器 ⚡

**列表推导式** 用一行表达式从可迭代对象构造列表，比手写循环更简洁：

\`\`\`python
squares = [x * x for x in range(1, 6)]        # [1, 4, 9, 16, 25]
evens = [x for x in range(1, 11) if x % 2 == 0]  # 过滤偶数
\`\`\`

- \`表达式 for 变量 in 可迭代对象\`：对每个元素求值。
- 末尾追加 \`if 条件\`：只保留满足条件的元素。

### 生成器表达式

把方括号换成圆括号就是**生成器**，它按需惰性产出元素，内存占用小，常直接传给 \`sum()\`、\`max()\` 等：
\`\`\`python
print(sum(x * x for x in range(1, 6)))  # 55
\`\`\`

### 实战挑战

输出 1~5 的平方列表、1~10 的偶数列表，以及 1~5 的平方和：
\`\`\`text
[1, 4, 9, 16, 25]
evens: [2, 4, 6, 8, 10]
sum of squares: 55
\`\`\``,
    starterCode: `# TODO: 生成 1~5 的平方列表并输出

# TODO: 用 if 过滤出 1~10 的偶数并输出

# TODO: 用生成器求 1~5 的平方和并输出
`,
    answerCode: `squares = [x * x for x in range(1, 6)]
print(squares)

evens = [x for x in range(1, 11) if x % 2 == 0]
print("evens:", evens)

print("sum of squares:", sum(x * x for x in range(1, 6)))
`,
  },
  {
    id: 8,
    title: '函数进阶：参数、lambda 与高阶函数',
    difficulty: '进阶',
    estimatedMinutes: 14,
    goals: ['用 *args 接收可变数量参数', '用 lambda 编写匿名函数', '用 sorted 的 key 参数自定义排序'],
    hint: 'def total(*nums) 用 sum(nums) 求和；sorted(pairs, key=lambda p: p[1]) 按第二个元素排序；lambda x: x * 2 是匿名函数。',
    expectedOutput: '6\n[(\'b\', 1), (\'a\', 2), (\'c\', 3)]\n10',
    tutorial: `# 第 8 章：函数进阶 — 参数、lambda 与高阶函数 🧠

### 可变参数

\`*args\` 把多余的位置参数收进一个元组：
\`\`\`python
def total(*nums):
    return sum(nums)

total(1, 2, 3)  # 6
\`\`\`
类似地，\`**kwargs\` 收集关键字参数为字典。

### lambda 匿名函数

\`lambda 参数: 表达式\` 定义一个没有名字的小函数：
\`\`\`python
double = lambda x: x * 2
\`\`\`

### 高阶函数与 key

\`sorted\`、\`map\`、\`filter\` 都能接收函数作为参数。用 \`key\` 指定排序依据：
\`\`\`python
sorted(pairs, key=lambda p: p[1])  # 按每个元组的第二个元素排序
\`\`\`

### 实战挑战

输出 \`total(1, 2, 3)\`、按第二个元素排序后的 \`[("a", 2), ("b", 1), ("c", 3)]\`，以及 \`double(5)\`：
\`\`\`text
6
[('b', 1), ('a', 2), ('c', 3)]
10
\`\`\``,
    starterCode: `def total(*nums):
    # TODO: 返回所有参数之和
    return 0

pairs = [("a", 2), ("b", 1), ("c", 3)]

# TODO: 输出求和、按第二个元素排序的结果、以及 lambda 加倍 5 的结果
`,
    answerCode: `def total(*nums):
    return sum(nums)

print(total(1, 2, 3))

pairs = [("a", 2), ("b", 1), ("c", 3)]
print(sorted(pairs, key=lambda p: p[1]))

double = lambda x: x * 2
print(double(5))
`,
  },
  {
    id: 9,
    title: '面向对象：类与实例',
    difficulty: '进阶',
    estimatedMinutes: 14,
    goals: ['用 class 定义类并实现 __init__', '通过 self 访问实例属性', '定义并调用实例方法'],
    hint: '在 __init__ 里用 self.name / self.age 保存属性；describe() 返回描述字符串；birthday() 让 self.age 加一。',
    expectedOutput: 'Ada is 18 years old\nAda had a birthday!\nAda is 19 years old',
    tutorial: `# 第 9 章：面向对象 — 类与实例 🏗️

**类（class）** 是创建对象的模板。特殊方法 \`__init__\` 是构造器，在创建实例时自动调用；第一个参数 \`self\` 指向实例本身。

\`\`\`python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def describe(self):
        return f"{self.name} is {self.age} years old"

    def birthday(self):
        self.age += 1
\`\`\`

- \`self.name = name\`：把参数保存为**实例属性**。
- 方法就是定义在类里、第一个参数为 \`self\` 的函数。
- 创建实例：\`p = Person("Ada", 18)\`；调用方法：\`p.describe()\`。

### 实战挑战

创建 \`Person("Ada", 18)\`，打印描述，过一次生日后再打印：
\`\`\`text
Ada is 18 years old
Ada had a birthday!
Ada is 19 years old
\`\`\``,
    starterCode: `class Person:
    def __init__(self, name, age):
        # TODO: 保存 name 和 age 为实例属性
        pass

    def describe(self):
        # TODO: 返回 "<name> is <age> years old"
        return ""

    def birthday(self):
        # TODO: 让年龄加一
        pass

p = Person("Ada", 18)
print(p.describe())
print(f"{p.name} had a birthday!")
p.birthday()
print(p.describe())
`,
    answerCode: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def describe(self):
        return f"{self.name} is {self.age} years old"

    def birthday(self):
        self.age += 1

p = Person("Ada", 18)
print(p.describe())
print(f"{p.name} had a birthday!")
p.birthday()
print(p.describe())
`,
  },
  {
    id: 10,
    title: '继承、多态与魔术方法',
    difficulty: '挑战',
    estimatedMinutes: 15,
    goals: ['用继承派生子类并重写方法', '通过统一接口体现多态', '实现 __str__ 自定义打印'],
    hint: 'Dog、Cat 继承 Animal 并重写 speak()；用 type(animal).__name__ 取类名；在 Animal 里实现 __str__ 让 print 显示自定义文本。',
    expectedOutput: 'Dog says Woof\nCat says Meow\nAnimal(Rex)',
    tutorial: `# 第 10 章：继承、多态与魔术方法 🧬

**继承** 让子类复用父类的属性与方法：\`class Dog(Animal)\` 表示 Dog 继承 Animal。子类可以**重写（override）** 父类方法。

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "..."
    def __str__(self):
        return f"Animal({self.name})"

class Dog(Animal):
    def speak(self):
        return "Woof"
\`\`\`

### 多态

不同子类实现同名方法后，可以用统一方式调用，运行时自动分派到各自的实现——这就是**多态**。\`type(obj).__name__\` 能取到对象的类名。

### 魔术方法

\`__str__\` 决定 \`print(对象)\` 显示的内容。这类以双下划线包裹的方法称为**魔术方法 / dunder**。

### 实战挑战

让 \`Dog\`、\`Cat\` 重写 \`speak()\`，遍历打印它们的叫声，并用 \`__str__\` 打印一个 Animal：
\`\`\`text
Dog says Woof
Cat says Meow
Animal(Rex)
\`\`\``,
    starterCode: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

    def __str__(self):
        # TODO: 返回 "Animal(<name>)"
        return ""

class Dog(Animal):
    # TODO: 重写 speak 返回 "Woof"
    pass

class Cat(Animal):
    # TODO: 重写 speak 返回 "Meow"
    pass

for animal in [Dog("Rex"), Cat("Mia")]:
    print(f"{type(animal).__name__} says {animal.speak()}")

print(Animal("Rex"))
`,
    answerCode: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

    def __str__(self):
        return f"Animal({self.name})"

class Dog(Animal):
    def speak(self):
        return "Woof"

class Cat(Animal):
    def speak(self):
        return "Meow"

for animal in [Dog("Rex"), Cat("Mia")]:
    print(f"{type(animal).__name__} says {animal.speak()}")

print(Animal("Rex"))
`,
  },
  {
    id: 11,
    title: '异常处理与健壮性',
    difficulty: '挑战',
    estimatedMinutes: 14,
    goals: ['用 try/except 捕获特定异常', '为异常场景提供回退值', '用 is None 判断并分支输出'],
    hint: '在 safe_div 里用 try/except ZeroDivisionError，除零时返回 None；主程序读入两个整数，结果为 None 时输出提示，否则输出算式。',
    expectedOutput: '10 / 2 = 5.0',
    defaultStdin: '10\n2',
    testCases: [
      { id: 'div-ok', title: '10 / 2', stdin: '10\n2', expectedOutput: '10 / 2 = 5.0' },
      { id: 'div-zero', title: '10 / 0', stdin: '10\n0', expectedOutput: 'cannot divide by zero' },
      { id: 'div-three', title: '9 / 3', stdin: '9\n3', expectedOutput: '9 / 3 = 3.0' },
    ],
    tutorial: `# 第 11 章：异常处理与健壮性 🛡️

运行期出错时，Python 会**抛出异常**并中断程序。用 \`try/except\` 可以捕获并优雅处理：

\`\`\`python
def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None
\`\`\`

- \`try\` 块放可能出错的代码。
- \`except 异常类型\`：只捕获匹配的异常，其它异常继续向上抛。
- 还可搭配 \`else\`（未出错时执行）与 \`finally\`（无论如何都执行，常用于清理资源）。

### 用回退值表达失败

除法返回 \`None\` 代表“无法计算”，调用方用 \`if result is None\` 判断，比让程序崩溃更健壮。注意 \`/\` 得到的是浮点数，\`10 / 2\` 为 \`5.0\`。

### 实战挑战

从标准输入读入两个整数 a、b，输出 \`a / b = 结果\`；当 b 为 0 时输出 \`cannot divide by zero\`。`,
    starterCode: `def safe_div(a, b):
    # TODO: 用 try/except 捕获除零，出错时返回 None
    return a / b

a = int(input())
b = int(input())
result = safe_div(a, b)
# TODO: result 为 None 时输出提示，否则输出算式
`,
    answerCode: `def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

a = int(input())
b = int(input())
result = safe_div(a, b)
if result is None:
    print("cannot divide by zero")
else:
    print(f"{a} / {b} = {result}")
`,
  },
  {
    id: 12,
    title: '模块、装饰器与迭代',
    difficulty: '挑战',
    estimatedMinutes: 15,
    goals: ['用 import 引入标准库模块', '编写并应用一个装饰器', '理解装饰器如何包裹原函数'],
    hint: 'import math 后用 math.sqrt(16)；装饰器 logged 内部定义 wrapper，先打印 "[calling]" 和 func.__name__ 再调用原函数；用 @logged 装饰 add。',
    expectedOutput: 'sqrt(16) = 4.0\n[calling] add\n7',
    tutorial: `# 第 12 章：模块、装饰器与迭代 🧰

### 模块

标准库通过 \`import\` 引入，例如数学模块：
\`\`\`python
import math
print(math.sqrt(16))  # 4.0
\`\`\`

### 装饰器

装饰器是“接收函数、返回新函数”的高阶函数，常用于在不改动原函数的前提下追加行为（日志、计时等）：
\`\`\`python
def logged(func):
    def wrapper(*args, **kwargs):
        print("[calling]", func.__name__)
        return func(*args, **kwargs)
    return wrapper

@logged
def add(a, b):
    return a + b
\`\`\`

\`@logged\` 等价于 \`add = logged(add)\`。调用 \`add(3, 4)\` 时会先执行 \`wrapper\`，打印日志再转调原函数。

### 实战挑战

先输出 \`sqrt(16) = 4.0\`，再调用被 \`@logged\` 装饰的 \`add(3, 4)\`：
\`\`\`text
sqrt(16) = 4.0
[calling] add
7
\`\`\``,
    starterCode: `import math

def logged(func):
    def wrapper(*args, **kwargs):
        # TODO: 打印 "[calling]" 和函数名，再调用原函数
        return func(*args, **kwargs)
    return wrapper

@logged
def add(a, b):
    return a + b

# TODO: 输出 sqrt(16)，再打印 add(3, 4)
`,
    answerCode: `import math

def logged(func):
    def wrapper(*args, **kwargs):
        print("[calling]", func.__name__)
        return func(*args, **kwargs)
    return wrapper

@logged
def add(a, b):
    return a + b

print("sqrt(16) =", math.sqrt(16))
print(add(3, 4))
`,
  },
  {
    id: 13,
    title: '综合实战：词频统计',
    difficulty: '挑战',
    estimatedMinutes: 18,
    goals: ['用 split 切分并用字典累计词频', '用 sorted 配合多关键字排序', '按次数降序、同频按字母升序输出'],
    hint: '用 counts.get(word, 0) + 1 累计；排序键用 lambda kv: (-kv[1], kv[0]) 实现“次数降序、字母升序”；逐行输出 "word: count"。',
    expectedOutput: 'the: 3\ncat: 2\nmat: 1\non: 1\nsat: 1',
    defaultStdin: 'the cat sat on the mat the cat',
    testCases: [
      { id: 'wc-basic', title: '多词句子', stdin: 'the cat sat on the mat the cat', expectedOutput: 'the: 3\ncat: 2\nmat: 1\non: 1\nsat: 1' },
      { id: 'wc-single', title: '单个单词', stdin: 'hello', expectedOutput: 'hello: 1' },
      { id: 'wc-tie', title: '同频排序', stdin: 'b a b a c', expectedOutput: 'a: 2\nb: 2\nc: 1' },
    ],
    tutorial: `# 第 13 章：综合实战 — 词频统计 🏁

本章综合运用字符串、字典、排序与 lambda，实现一个经典的**词频统计**程序。

### 思路拆解

1. 用 \`line.split()\` 把一行文本切成单词列表。
2. 用字典累计：\`counts[word] = counts.get(word, 0) + 1\`。
3. 排序输出：希望**次数多的在前，次数相同按字母升序**。可用元组作为排序键：
\`\`\`python
sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
\`\`\`
其中 \`-kv[1]\` 让次数降序，\`kv[0]\` 让同频时按单词升序。

### 输出格式

逐行输出 \`单词: 次数\`，例如 \`the: 3\`。

### 实战挑战

从标准输入读入一行以空格分隔的单词，按上述规则输出词频。对于 \`the cat sat on the mat the cat\`：
\`\`\`text
the: 3
cat: 2
mat: 1
on: 1
sat: 1
\`\`\``,
    starterCode: `line = input()
counts = {}

# TODO: 统计每个单词出现的次数

# TODO: 按“次数降序、同频字母升序”输出 "word: count"
`,
    answerCode: `line = input()
counts = {}
for word in line.split():
    counts[word] = counts.get(word, 0) + 1

for word, count in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
    print(f"{word}: {count}")
`,
  },
];
