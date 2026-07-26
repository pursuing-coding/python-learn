// Python interactive course catalog for python-learn (33 lessons, 5 levels).
// Content follows the official Python tutorial (docs.python.org/zh-cn/3/) and
// stays compatible with Python 3.8 (the Judge0 cloud runner's version).
window.PY_LESSONS = [
  {
    id: 1,
    title: 'Python 解释执行模型与第一个程序',
    difficulty: '基础',
    estimatedMinutes: 8,
    goals: ['理解 Python 的解释执行模型', '使用 print() 向标准输出打印文本', '用 # 编写单行注释'],
    hint: '直接调用内建函数 print()，把要输出的字符串放进英文双引号里即可。',
    expectedOutput: 'Hello, Python World!',
    sources: [
      { title: '官方教程：课前甜点', url: 'https://docs.python.org/zh-cn/3/tutorial/appetite.html' },
      { title: '官方教程：使用解释器', url: 'https://docs.python.org/zh-cn/3/tutorial/interpreter.html' }
    ],
    tutorial: `# 第 1 章：解释执行模型与第一个程序 🐍

欢迎来到 Python 世界！Python 是一门**解释型**、**动态类型**的高级语言，语法接近自然语言，是公认最适合零基础入门的编程语言之一。

### Python 是怎么运行你的代码的

你写下的 \`.py\` 源文件会交给 **CPython 解释器**处理：它先把源码编译成中间形式“字节码”，再交由 Python 虚拟机逐条执行。整个过程自动完成，因此无需像 C++ 那样手动编译链接——写完即可运行，这让 Python 特别适合快速实验和学习。

### 核心要素

- \`print(...)\`：内建函数，把内容写入标准输出（也就是屏幕），末尾默认自动换行。
- 字符串字面量：用一对引号包裹的文本，\`"..."\` 与 \`'...'\` 完全等价。
- 注释：以 \`#\` 开头，直到行尾都会被解释器忽略，用来给人类读者留说明。

\`\`\`python
# 这是一行注释，解释器会跳过它
print("你好")      # 注释也可以跟在代码后面
print('单引号也可以')
\`\`\`

### 常见坑

- 引号必须是**英文**引号，中文引号 \`“”\` 会导致语法错误。
- \`print\` 是全小写；Python 严格区分大小写，\`Print\` 会报 \`NameError\`。

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
    sources: [
      { title: '官方教程：Python 速览', url: 'https://docs.python.org/zh-cn/3/tutorial/introduction.html' },
      { title: '官方文档：内置类型', url: 'https://docs.python.org/zh-cn/3/library/stdtypes.html' }
    ],
    tutorial: `# 第 2 章：变量、动态类型与内建类型 🧩

在 Python 中，变量只是指向对象的**名字**，无需事先声明类型。赋值语句 \`x = 值\` 会让名字 \`x\` 绑定到右侧对象上，类型由对象本身决定，这就是**动态类型**。

\`\`\`python
x = 18        # x 指向一个 int
x = "hello"   # 现在 x 改指向一个 str，完全合法
\`\`\`

### 常见内建类型

- \`int\`：整数，例如 \`18\`，大小不限（可以算任意大的数）。
- \`float\`：浮点数，例如 \`96.5\`。
- \`str\`：字符串，例如 \`"Ada"\`。
- \`bool\`：布尔值 \`True\` / \`False\`（注意首字母大写）。

用内建函数 \`type(对象)\` 可以查看其类型对象，例如 \`type(18)\` 会得到 \`<class 'int'>\`。

### 变量命名规范

官方风格指南（PEP 8）建议用**小写字母 + 下划线**命名：\`user_name\`、\`total_count\`。名字要能表达含义，不要用 \`a\`、\`b\`、\`x1\` 这类无意义的名字。

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
    title: '数字与运算符',
    difficulty: '基础',
    estimatedMinutes: 10,
    goals: ['区分 / 真除与 // 整除', '用 % 取余、** 求幂', '从标准输入读取整数参与运算'],
    hint: '用 int(input()) 依次读入 a、b，再按顺序输出五个算式；f"{a} + {b} = {a + b}" 这样的 f-string 最方便。',
    expectedOutput: '17 + 5 = 22\n17 // 5 = 3\n17 % 5 = 2\n17 ** 2 = 289\n17 / 5 = 3.4',
    defaultStdin: '17\n5',
    testCases: [
      { id: 'ops-17-5', title: 'a=17 b=5', stdin: '17\n5', expectedOutput: '17 + 5 = 22\n17 // 5 = 3\n17 % 5 = 2\n17 ** 2 = 289\n17 / 5 = 3.4' },
      { id: 'ops-9-4', title: 'a=9 b=4', stdin: '9\n4', expectedOutput: '9 + 4 = 13\n9 // 4 = 2\n9 % 4 = 1\n9 ** 2 = 81\n9 / 4 = 2.25' },
      { id: 'ops-12-6', title: 'a=12 b=6', stdin: '12\n6', expectedOutput: '12 + 6 = 18\n12 // 6 = 2\n12 % 6 = 0\n12 ** 2 = 144\n12 / 6 = 2.0', note: '整除时 / 依然返回浮点数 2.0。' }
    ],
    sources: [
      { title: '官方教程：数字', url: 'https://docs.python.org/zh-cn/3/tutorial/introduction.html#numbers' },
      { title: '官方文档：数值类型', url: 'https://docs.python.org/zh-cn/3/library/stdtypes.html#numeric-types-int-float-complex' }
    ],
    tutorial: `# 第 3 章：数字与运算符 ➗

Python 可以当一个强大的计算器用。除了加减乘除，还有几个新手必须分清的运算符。

### 运算符一览

- \`+\` \`-\` \`*\`：加、减、乘，与数学一致。
- \`/\`：**真除法**，结果永远是浮点数——\`10 / 2\` 得 \`5.0\` 而不是 \`5\`。
- \`//\`：**整除**（向下取整），\`17 // 5\` 得 \`3\`。
- \`%\`：**取余**，\`17 % 5\` 得 \`2\`；判断奇偶、按位拆数字全靠它。
- \`**\`：**乘方**，\`17 ** 2\` 得 \`289\`。

\`\`\`python
print(7 / 2)    # 3.5
print(7 // 2)   # 3
print(7 % 2)    # 1
print(2 ** 10)  # 1024
\`\`\`

### 运算优先级

与数学一致：先乘方，再乘除与取余，最后加减；不确定时**加圆括号**最稳妥，也更易读。

### 读取输入并转换类型

\`input()\` 读入的是**字符串**，参与数值运算前必须用 \`int(...)\` 或 \`float(...)\` 转换：
\`\`\`python
a = int(input())   # 读入一行并转成整数
\`\`\`
忘记转换是新手最常见的错误之一：\`"17" + "5"\` 会得到字符串拼接 \`"175"\` 而不是 \`22\`。

### 实战挑战

从标准输入读入两个整数 a、b，按顺序输出五个算式（示例为 a=17、b=5）：
\`\`\`text
17 + 5 = 22
17 // 5 = 3
17 % 5 = 2
17 ** 2 = 289
17 / 5 = 3.4
\`\`\``,
    starterCode: `a = int(input())
b = int(input())

# TODO: 依次输出 a + b、a // b、a % b、a ** 2、a / b 五个算式
`,
    answerCode: `a = int(input())
b = int(input())

print(f"{a} + {b} = {a + b}")
print(f"{a} // {b} = {a // b}")
print(f"{a} % {b} = {a % b}")
print(f"{a} ** 2 = {a ** 2}")
print(f"{a} / {b} = {a / b}")
`,
  },
  {
    id: 4,
    title: '字符串入门：索引、切片与转义',
    difficulty: '基础',
    estimatedMinutes: 10,
    goals: ['用下标访问单个字符（含负数下标）', '用切片截取子串', '用 len() 与 in 检查字符串'],
    hint: 'word[0] 取第一个字符，word[-1] 取最后一个，word[:4] 取前四个；len(word) 求长度，"th" in word 判断包含。',
    expectedOutput: 'first: P\nlast: n\nslice: Pyth\nlength: 6\nhas \'th\': True',
    sources: [
      { title: '官方教程：字符串', url: 'https://docs.python.org/zh-cn/3/tutorial/introduction.html#text' },
      { title: '官方文档：文本序列类型', url: 'https://docs.python.org/zh-cn/3/library/stdtypes.html#text-sequence-type-str' }
    ],
    tutorial: `# 第 4 章：字符串入门 — 索引、切片与转义 🔤

字符串是**字符的有序序列**，可以像查字典一样按位置访问其中的字符。

### 索引：按位置取字符

下标从 **0** 开始；负数下标从末尾往前数：
\`\`\`python
word = "Python"
word[0]    # 'P'（第一个）
word[1]    # 'y'
word[-1]   # 'n'（最后一个）
word[-2]   # 'o'（倒数第二个）
\`\`\`

### 切片：截取子串

\`word[起点:终点]\` 取从起点到**终点前一位**的子串（含头不含尾）：
\`\`\`python
word[0:4]   # 'Pyth'
word[:4]    # 同上，起点省略默认为 0
word[2:]    # 'thon'，终点省略默认到结尾
\`\`\`

### 长度与包含判断

- \`len(word)\`：字符个数。
- \`"th" in word\`：判断子串是否出现，结果是 \`True\` / \`False\`。

### 转义字符

在引号内，反斜杠开启**转义**：\`\\n\` 表示换行，\`\\t\` 表示制表符，\`\\"\` 表示引号本身：
\`\`\`python
print("第一行\\n第二行")     # 输出两行
print("他说：\\"你好\\"")     # 输出 他说："你好"
\`\`\`

### 常见坑

- 下标越界（如 \`word[100]\`）会抛出 \`IndexError\`，但**切片越界不会报错**，只会截到实际结尾。
- 字符串是**不可变**的：\`word[0] = "J"\` 会报错，想改只能创建新字符串。

### 实战挑战

对 \`word = "Python"\` 依次输出：
\`\`\`text
first: P
last: n
slice: Pyth
length: 6
has 'th': True
\`\`\``,
    starterCode: `word = "Python"

# TODO: 依次输出第一个字符、最后一个字符、前四个字符、长度、是否包含 "th"
`,
    answerCode: `word = "Python"

print("first:", word[0])
print("last:", word[-1])
print("slice:", word[:4])
print("length:", len(word))
print("has 'th':", "th" in word)
`,
  },
  {
    id: 5,
    title: '条件分支：if / elif / else',
    difficulty: '基础',
    estimatedMinutes: 12,
    goals: ['用 if/elif/else 编写多路分支', '使用比较与逻辑运算符组合条件', '理解缩进如何划分代码块'],
    hint: '按 90/80/60 三个门槛从高到低依次 if/elif 判断，把等级存进 grade，最后用 f-string 输出 score 与 grade。',
    expectedOutput: 'score=95 grade=A',
    defaultStdin: '95',
    testCases: [
      { id: 'grade-a', title: '95 分 → A', stdin: '95', expectedOutput: 'score=95 grade=A' },
      { id: 'grade-b', title: '82 分 → B', stdin: '82', expectedOutput: 'score=82 grade=B' },
      { id: 'grade-c', title: '60 分 → C', stdin: '60', expectedOutput: 'score=60 grade=C', note: '边界值：刚好 60 分属于 C。' },
      { id: 'grade-d', title: '45 分 → D', stdin: '45', expectedOutput: 'score=45 grade=D' }
    ],
    sources: [
      { title: '官方教程：if 语句', url: 'https://docs.python.org/zh-cn/3/tutorial/controlflow.html#if-statements' },
      { title: '官方文档：真值检测', url: 'https://docs.python.org/zh-cn/3/library/stdtypes.html#truth-value-testing' }
    ],
    tutorial: `# 第 5 章：条件分支 — if / elif / else 🔀

程序需要根据不同情况走不同的路，这就是**分支**。Python 用 \`if\` / \`elif\` / \`else\` 表达，并且用**缩进（4 个空格）**来划分每个分支的代码块——这是 Python 最独特的语法设计。

\`\`\`python
score = 95
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 60:
    grade = "C"
else:
    grade = "D"
\`\`\`

- 条件从上往下**依次判断**，命中一个就跳过其余分支，所以门槛要从高到低排。
- \`elif\` 可以有任意多个；\`else\` 兜底，可省略。
- 冒号 \`:\` 不能少，冒号后的块必须缩进。

### 比较与逻辑运算符

- 比较：\`==\`（相等）、\`!=\`、\`>\`、\`>=\`、\`<\`、\`<=\`。注意 \`=\` 是赋值，\`==\` 才是比较！
- 逻辑组合：\`and\`、\`or\`、\`not\`，例如 \`18 <= age and age < 60\`，还可以写成链式比较 \`18 <= age < 60\`。

### 真值检测

\`if\` 后面不一定是 True/False：空字符串、空列表、\`0\`、\`None\` 都被当作“假”，非空/非零当作“真”。所以 \`if name:\` 就能判断 name 非空。

### 实战挑战

从标准输入读入整数成绩，按 “90 以上 A、80 以上 B、60 以上 C、其余 D” 输出：
\`\`\`text
score=95 grade=A
\`\`\``,
    starterCode: `score = int(input())

# TODO: 用 if/elif/else 求出等级 grade（A/B/C/D）

# TODO: 输出 score=<分数> grade=<等级>
`,
    answerCode: `score = int(input())

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 60:
    grade = "C"
else:
    grade = "D"

print(f"score={score} grade={grade}")
`,
  },
  {
    id: 6,
    title: 'while 循环与 break / continue',
    difficulty: '基础',
    estimatedMinutes: 12,
    goals: ['用 while 编写条件循环', '在循环中更新变量避免死循环', '用 % 和 // 逐位拆解整数'],
    hint: '当 n > 0 时循环：total 累加 n % 10（个位），再 n //= 10 砍掉个位；n 为 0 时循环体不执行，直接输出 0。',
    expectedOutput: 'digit sum: 10',
    defaultStdin: '1234',
    testCases: [
      { id: 'digits-1234', title: 'n = 1234', stdin: '1234', expectedOutput: 'digit sum: 10' },
      { id: 'digits-9', title: 'n = 9', stdin: '9', expectedOutput: 'digit sum: 9' },
      { id: 'digits-0', title: 'n = 0', stdin: '0', expectedOutput: 'digit sum: 0', note: '边界值：0 没有可拆的数位，结果为 0。' }
    ],
    sources: [
      { title: '官方教程：其他流程控制工具', url: 'https://docs.python.org/zh-cn/3/tutorial/controlflow.html' },
      { title: '官方参考：while 语句', url: 'https://docs.python.org/zh-cn/3/reference/compound_stmts.html#the-while-statement' }
    ],
    tutorial: `# 第 6 章：while 循环与 break / continue 🔁

\`while\` 让一段代码在**条件成立期间反复执行**，适合“不知道要循环多少次”的场景。

\`\`\`python
n = 1234
total = 0
while n > 0:
    total += n % 10   # 取个位：1234 % 10 = 4
    n //= 10          # 砍掉个位：1234 // 10 = 123
print(total)          # 1 + 2 + 3 + 4 = 10
\`\`\`

每一轮都会重新检查条件；条件一旦为假，循环结束。**循环体内必须让条件朝“结束”的方向变化**（这里 n 不断变小），否则就是死循环。

### break 与 continue

- \`break\`：立即**跳出整个循环**。
- \`continue\`：跳过本轮剩余语句，**直接进入下一轮**。

\`\`\`python
while True:              # 故意写成永真
    line = input()
    if line == "quit":
        break            # 用户输入 quit 才退出
\`\`\`
\`while True\` + \`break\` 是处理“不定次数输入”的经典写法。

### 常见坑

- 忘记更新循环变量 → 死循环（程序卡住不动）。
- \`while n:\` 利用真值检测等价于 \`while n != 0:\`，简洁但初学阶段建议写明条件。

### 实战挑战

从标准输入读入非负整数 n，用 while 循环求**各位数字之和**：
\`\`\`text
digit sum: 10
\`\`\`
（1234 的各位和为 1+2+3+4=10）`,
    starterCode: `n = int(input())
total = 0

# TODO: 用 while 循环把 n 的每一位加到 total 上

print("digit sum:", total)
`,
    answerCode: `n = int(input())
total = 0

while n > 0:
    total += n % 10
    n //= 10

print("digit sum:", total)
`,
  },
  {
    id: 7,
    title: 'for 循环、range 与嵌套循环',
    difficulty: '基础',
    estimatedMinutes: 12,
    goals: ['用 for + range 做计数循环', '编写双层嵌套循环', '用 join 拼接一行内的多个结果'],
    hint: '外层 for i in range(1, 4)，内层 for j in range(1, i + 1)；把每个 f"{i}x{j}={i*j}" 收进列表，再用 " ".join(row) 输出一行。',
    expectedOutput: '1x1=1\n2x1=2 2x2=4\n3x1=3 3x2=6 3x3=9',
    sources: [
      { title: '官方教程：for 语句', url: 'https://docs.python.org/zh-cn/3/tutorial/controlflow.html#for-statements' },
      { title: '官方教程：range() 函数', url: 'https://docs.python.org/zh-cn/3/tutorial/controlflow.html#the-range-function' }
    ],
    tutorial: `# 第 7 章：for 循环、range 与嵌套循环 🔂

\`for\` 用来**遍历一个序列的每个元素**，配合 \`range()\` 就是最常用的计数循环。

### range 的三种形态

- \`range(5)\`：0、1、2、3、4（从 0 开始，不含 5）。
- \`range(1, 6)\`：1、2、3、4、5（含头不含尾）。
- \`range(0, 10, 2)\`：0、2、4、6、8（第三个参数是步长）。

\`\`\`python
for i in range(1, 4):
    print(i)          # 依次输出 1、2、3
\`\`\`

### 嵌套循环

循环里还可以套循环。外层每走一步，内层完整跑一遍——经典应用就是乘法表：
\`\`\`python
for i in range(1, 4):
    for j in range(1, i + 1):   # 内层次数随 i 变化
        ...
\`\`\`

### 控制一行输出多项

\`print\` 默认换行。想把一行的多项拼在一起，推荐先收集到列表再用 \`join\`：
\`\`\`python
row = []
for j in range(1, 4):
    row.append(f"3x{j}={3 * j}")
print(" ".join(row))    # 3x1=3 3x2=6 3x3=9
\`\`\`
这样能精确控制分隔符，也不会残留行尾空格。

### 实战挑战

用嵌套循环输出乘法表的前三行（每行内用单个空格分隔）：
\`\`\`text
1x1=1
2x1=2 2x2=4
3x1=3 3x2=6 3x3=9
\`\`\``,
    starterCode: `# TODO: 外层遍历 1~3，内层遍历 1~i，拼出每行的 ixj=积 并输出
for i in range(1, 4):
    row = []
    # TODO: 内层循环 append 每一项，然后输出 " ".join(row)
`,
    answerCode: `for i in range(1, 4):
    row = []
    for j in range(1, i + 1):
        row.append(f"{i}x{j}={i * j}")
    print(" ".join(row))
`,
  },
  {
    id: 8,
    title: '函数：定义、参数与返回值',
    difficulty: '基础',
    estimatedMinutes: 12,
    goals: ['用 def 定义带参数的函数', '用 return 返回计算结果', '理解默认参数与 None 返回值'],
    hint: '定义 sum_to(n)，用 for i in range(1, n + 1) 把 1 到 n 累加；从标准输入读入 n 时记得用 int() 转换。',
    expectedOutput: '55',
    defaultStdin: '10',
    testCases: [
      { id: 'sum-10', title: 'n = 10', stdin: '10', expectedOutput: '55' },
      { id: 'sum-5', title: 'n = 5', stdin: '5', expectedOutput: '15' },
      { id: 'sum-zero', title: 'n = 0', stdin: '0', expectedOutput: '0', note: '边界示例：n 为 0 时结果应为 0。' }
    ],
    sources: [
      { title: '官方教程：定义函数', url: 'https://docs.python.org/zh-cn/3/tutorial/controlflow.html#defining-functions' },
      { title: '官方教程：函数标注与默认值', url: 'https://docs.python.org/zh-cn/3/tutorial/controlflow.html#more-on-defining-functions' }
    ],
    tutorial: `# 第 8 章：函数 — 定义、参数与返回值 📦

**函数**是给一段可复用逻辑起个名字。用 \`def\` 定义，函数体缩进：

\`\`\`python
def sum_to(n):
    """返回 1 + 2 + ... + n 的和。"""
    total = 0
    for i in range(1, n + 1):
        total += i
    return total

print(sum_to(10))   # 55
\`\`\`

- \`n\` 是**形参**，调用时传入的 \`10\` 是**实参**。
- \`return\` 把结果交回给调用方并立刻结束函数；没有 \`return\` 的函数返回 \`None\`。
- 第一行的三引号字符串叫 **docstring**，是函数的官方说明文档，好习惯从第一天养成。

### 默认参数

参数可以带默认值，调用时可省略：
\`\`\`python
def greet(name, greeting="Hi"):
    return f"{greeting}, {name}!"

greet("Ada")             # 'Hi, Ada!'
greet("Ada", "Hello")    # 'Hello, Ada!'
\`\`\`

### 为什么要写函数

- **复用**：同一逻辑写一次，到处调用。
- **命名**：\`sum_to(n)\` 比十行裸代码更能表达意图。
- **可测试**：函数可以单独验证（第 29 章会专门练习）。

### 实战挑战

从标准输入读入整数 n，输出 \`1 + 2 + ... + n\` 的和。\`n = 10\` 时应输出 \`55\`；注意 n 为 0 时循环一次都不执行，应返回 0。`,
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
    id: 9,
    title: '序列容器：列表与元组',
    difficulty: '基础',
    estimatedMinutes: 12,
    goals: ['创建列表并用 append 追加元素', '使用切片截取子序列', '用 len() 获取序列长度'],
    hint: '先构造 [10, 20, 30]，append(40)，再用 nums[:2] 取前两个元素，最后用 len(nums) 输出长度。',
    expectedOutput: '[10, 20, 30, 40]\nfirst two: [10, 20]\nlength: 4',
    sources: [
      { title: '官方教程：数据结构（列表）', url: 'https://docs.python.org/zh-cn/3/tutorial/datastructures.html' },
      { title: '官方文档：序列类型', url: 'https://docs.python.org/zh-cn/3/library/stdtypes.html#sequence-types-list-tuple-range' }
    ],
    tutorial: `# 第 9 章：序列容器 — 列表与元组 📦

**列表（list）** 是可变的有序序列，用方括号 \`[]\` 表示；**元组（tuple）** 是不可变的有序序列，用圆括号 \`()\` 表示。

### 常用操作

- 追加：\`nums.append(40)\` 在末尾加入元素。
- 插入 / 删除：\`nums.insert(0, 5)\`、\`nums.remove(20)\`、\`nums.pop()\`。
- 索引：\`nums[0]\` 取第一个，\`nums[-1]\` 取最后一个（与字符串一致）。
- 切片：\`nums[:2]\` 取前两个，\`nums[1:3]\` 取下标 1、2。
- 长度：\`len(nums)\` 返回元素个数。
- 判断包含：\`20 in nums\`。

切片会返回一个**新的列表**，不会修改原列表。

### 列表 vs 元组怎么选

- 列表：同类元素的集合，内容会增删改——如一批成绩、一组文件名。
- 元组：位置各有含义、创建后不再变——如坐标 \`(x, y)\`、日期 \`(2026, 7, 27)\`。元组不可变，因此可以当字典的键。

\`\`\`python
point = (3, 4)
x, y = point       # 元组解包：x=3, y=4
\`\`\`

### 常见坑

\`b = a\` 不是复制列表，而是让两个名字指向**同一个**列表；改 b 会“连带”改 a。真正复制用 \`b = a.copy()\` 或 \`b = a[:]\`。

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
    id: 10,
    title: '字典与集合',
    difficulty: '进阶',
    estimatedMinutes: 12,
    goals: ['用字典存储键值对并遍历 items()', '理解字典保持插入顺序', '用集合去重并统计数量'],
    hint: '用 for key, value in counts.items() 遍历字典逐行输出；集合 {..} 会自动去重，用 len() 统计唯一元素。',
    expectedOutput: 'apple -> 3\nbanana -> 2\nunique: 3',
    sources: [
      { title: '官方教程：字典', url: 'https://docs.python.org/zh-cn/3/tutorial/datastructures.html#dictionaries' },
      { title: '官方教程：集合', url: 'https://docs.python.org/zh-cn/3/tutorial/datastructures.html#sets' }
    ],
    tutorial: `# 第 10 章：字典与集合 🗂️

**字典（dict）** 存储“键 → 值”的映射，用 \`{}\` 定义。从 Python 3.7 起，字典会**保持插入顺序**。它是 Python 中最重要的数据结构之一——配置、计数、JSON 数据全靠它。

### 字典基本操作

\`\`\`python
counts = {"apple": 3, "banana": 2}
counts["apple"]        # 3，按键取值；键不存在会抛 KeyError
counts.get("pear", 0)  # 0，键不存在时返回默认值，更安全
counts["pear"] = 1     # 新增或覆盖
\`\`\`

### 字典遍历

\`\`\`python
for key, value in counts.items():
    print(key, "->", value)
\`\`\`

- \`counts.items()\` 返回“键值对”的可迭代视图；\`counts.keys()\`、\`counts.values()\` 分别只取键、只取值。

### 集合去重

**集合（set）** 是无序且元素唯一的容器。把带重复的数据放入集合即可去重，\`len(集合)\` 得到唯一元素个数。集合还支持交集 \`&\`、并集 \`|\`、差集 \`-\` 运算，处理“两组数据的重叠关系”非常方便。

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
    id: 11,
    title: '字符串方法与 f-string 格式化',
    difficulty: '进阶',
    estimatedMinutes: 12,
    goals: ['调用字符串方法如 upper()、split()', '使用 f-string 插值格式化', '统计一句话中的单词数'],
    hint: 'text.upper() 转大写；f"Hi, {name}!" 可把变量嵌入字符串；sentence.split() 按空白切分成单词列表，再用 len() 计数。',
    expectedOutput: 'HELLO\nHi, Ada! You are 18.\nwords: 3',
    sources: [
      { title: '官方文档：字符串方法', url: 'https://docs.python.org/zh-cn/3/library/stdtypes.html#string-methods' },
      { title: '官方教程：格式化字符串字面值', url: 'https://docs.python.org/zh-cn/3/tutorial/inputoutput.html#formatted-string-literals' }
    ],
    tutorial: `# 第 11 章：字符串方法与 f-string 格式化 ✂️

字符串是不可变序列，但提供了大量返回**新字符串**的方法。

### 常用方法

- \`text.upper()\` / \`text.lower()\`：大小写转换。
- \`text.strip()\`：去掉首尾空白（清洗用户输入必备）。
- \`text.replace("a", "b")\`：替换子串。
- \`text.startswith("http")\` / \`text.endswith(".py")\`：前后缀判断。
- \`sentence.split()\`：按空白拆分成单词列表；\`text.split(",")\` 按指定分隔符拆。
- \`",".join(items)\`：用分隔符把列表拼成字符串（与 split 互为逆操作）。

### f-string 格式化

在字符串前加 \`f\`，即可用 \`{表达式}\` 直接插值，这是官方推荐的现代格式化方式：
\`\`\`python
name = "Ada"
age = 18
print(f"Hi, {name}! You are {age}.")
print(f"明年 {age + 1} 岁")       # 大括号里可以写任意表达式
print(f"{3.14159:.2f}")           # 3.14，冒号后是格式说明（保留两位小数）
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
    id: 12,
    title: '推导式与生成器',
    difficulty: '进阶',
    estimatedMinutes: 12,
    goals: ['用列表推导式生成序列', '在推导式中加入 if 过滤条件', '用生成器表达式配合 sum() 求和'],
    hint: '[x * x for x in range(1, 6)] 生成平方；加 if x % 2 == 0 做过滤；sum(x * x for x in range(1, 6)) 直接求平方和。',
    expectedOutput: '[1, 4, 9, 16, 25]\nevens: [2, 4, 6, 8, 10]\nsum of squares: 55',
    sources: [
      { title: '官方教程：列表推导式', url: 'https://docs.python.org/zh-cn/3/tutorial/datastructures.html#list-comprehensions' },
      { title: '官方教程：生成器表达式', url: 'https://docs.python.org/zh-cn/3/tutorial/classes.html#generator-expressions' }
    ],
    tutorial: `# 第 12 章：推导式与生成器 ⚡

**列表推导式** 用一行表达式从可迭代对象构造列表，比手写循环更简洁，是最具 Python 风格（Pythonic）的写法之一：

\`\`\`python
squares = [x * x for x in range(1, 6)]        # [1, 4, 9, 16, 25]
evens = [x for x in range(1, 11) if x % 2 == 0]  # 过滤偶数
\`\`\`

- \`表达式 for 变量 in 可迭代对象\`：对每个元素求值。
- 末尾追加 \`if 条件\`：只保留满足条件的元素。
- 字典与集合也有推导式：\`{w: len(w) for w in words}\`。

### 生成器表达式

把方括号换成圆括号就是**生成器**，它按需惰性产出元素、不会一次性建出整个列表，内存占用小，常直接传给 \`sum()\`、\`max()\`、\`any()\` 等：
\`\`\`python
print(sum(x * x for x in range(1, 6)))  # 55
\`\`\`
处理百万级数据时，生成器与列表的内存差距是决定性的。

### 什么时候别用推导式

推导式套两层以上、或逻辑复杂到要换行时，退回普通 for 循环反而更清晰——**可读性优先**。

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
    id: 13,
    title: '内建函数工具箱：enumerate、zip 与聚合',
    difficulty: '进阶',
    estimatedMinutes: 12,
    goals: ['用 enumerate 同时拿到序号和元素', '用 zip 并行遍历两个列表', '用 max / sorted 做聚合与排序'],
    hint: 'enumerate(names, start=1) 从 1 开始编号；zip(names, scores) 把两个列表按位置配对；sorted(scores, reverse=True) 降序排列。',
    expectedOutput: '1 Ada\n2 Bob\n3 Cid\nAda: 85\nBob: 92\nCid: 78\nmax: 92\nsorted: [92, 85, 78]',
    sources: [
      { title: '官方文档：内置函数', url: 'https://docs.python.org/zh-cn/3/library/functions.html' },
      { title: '官方教程：循环的技巧', url: 'https://docs.python.org/zh-cn/3/tutorial/datastructures.html#looping-techniques' }
    ],
    tutorial: `# 第 13 章：内建函数工具箱 — enumerate、zip 与聚合 🧰

Python 自带约 70 个内建函数，熟练使用它们能让代码大幅缩短。本章挑最常用的几个。

### enumerate：遍历时要序号

不要写 \`for i in range(len(names))\` 再取 \`names[i]\`——官方推荐的写法是：
\`\`\`python
for i, name in enumerate(names, start=1):
    print(i, name)
\`\`\`
\`start=1\` 让编号从 1 开始（默认从 0）。

### zip：并行遍历多个序列

\`zip\` 把多个序列按位置配对，像拉链一样咬合：
\`\`\`python
names = ["Ada", "Bob"]
scores = [85, 92]
for name, score in zip(names, scores):
    print(f"{name}: {score}")
\`\`\`

### 聚合函数

- \`sum(nums)\` / \`max(nums)\` / \`min(nums)\`：求和、最大、最小。
- \`sorted(nums)\`：返回**新的**升序列表（原列表不动）；\`reverse=True\` 降序。
- \`any(...)\` / \`all(...)\`：是否存在 / 是否全部满足。
- \`len(x)\`、\`abs(x)\`、\`round(x, 2)\`：长度、绝对值、四舍五入。

### 实战挑战

对 \`names = ["Ada", "Bob", "Cid"]\` 与 \`scores = [85, 92, 78]\`，输出编号名单、配对成绩、最高分与降序列表：
\`\`\`text
1 Ada
2 Bob
3 Cid
Ada: 85
Bob: 92
Cid: 78
max: 92
sorted: [92, 85, 78]
\`\`\``,
    starterCode: `names = ["Ada", "Bob", "Cid"]
scores = [85, 92, 78]

# TODO: 用 enumerate 输出 "序号 名字"（从 1 开始）

# TODO: 用 zip 输出 "名字: 分数"

# TODO: 输出最高分与降序排列的分数列表
`,
    answerCode: `names = ["Ada", "Bob", "Cid"]
scores = [85, 92, 78]

for i, name in enumerate(names, start=1):
    print(i, name)

for name, score in zip(names, scores):
    print(f"{name}: {score}")

print("max:", max(scores))
print("sorted:", sorted(scores, reverse=True))
`,
  },
  {
    id: 14,
    title: '函数进阶：*args、lambda 与高阶函数',
    difficulty: '进阶',
    estimatedMinutes: 14,
    goals: ['用 *args 接收可变数量参数', '用 lambda 编写匿名函数', '用 sorted 的 key 参数自定义排序'],
    hint: 'def total(*nums) 用 sum(nums) 求和；sorted(pairs, key=lambda p: p[1]) 按第二个元素排序；lambda x: x * 2 是匿名函数。',
    expectedOutput: '6\n[(\'b\', 1), (\'a\', 2), (\'c\', 3)]\n10',
    sources: [
      { title: '官方教程：函数定义详解', url: 'https://docs.python.org/zh-cn/3/tutorial/controlflow.html#more-on-defining-functions' },
      { title: '官方指南：排序技术', url: 'https://docs.python.org/zh-cn/3/howto/sorting.html' }
    ],
    tutorial: `# 第 14 章：函数进阶 — *args、lambda 与高阶函数 🧠

### 可变参数

\`*args\` 把多余的位置参数收进一个元组：
\`\`\`python
def total(*nums):
    return sum(nums)

total(1, 2, 3)  # 6，想传几个传几个
\`\`\`
类似地，\`**kwargs\` 收集关键字参数为字典。内建的 \`print\` 就是这样接收任意多个参数的。

### lambda 匿名函数

\`lambda 参数: 表达式\` 定义一个没有名字的小函数，适合“只用一次”的场合：
\`\`\`python
double = lambda x: x * 2
double(5)   # 10
\`\`\`

### 高阶函数与 key

**接收函数作为参数**的函数叫高阶函数，\`sorted\`、\`max\`、\`min\` 都是。用 \`key\` 告诉它们“按什么排序 / 比较”：
\`\`\`python
pairs = [("a", 2), ("b", 1), ("c", 3)]
sorted(pairs, key=lambda p: p[1])     # 按每个元组的第二个元素排序
max(words, key=len)                    # 最长的单词
\`\`\`
这是 Python 中出场率最高的技巧之一——后面第 30、32 章的排序都靠它。

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
    id: 15,
    title: '作用域、闭包与递归',
    difficulty: '进阶',
    estimatedMinutes: 14,
    goals: ['理解局部与全局作用域（LEGB）', '用 nonlocal 编写闭包计数器', '写出带终止条件的递归函数'],
    hint: 'make_counter 内部定义 increment，用 nonlocal count 修改外层变量并返回 count；factorial 的终止条件是 n <= 1 时返回 1。',
    expectedOutput: '1\n2\n5! = 120',
    sources: [
      { title: '官方教程：作用域和命名空间', url: 'https://docs.python.org/zh-cn/3/tutorial/classes.html#python-scopes-and-namespaces' },
      { title: '官方参考：命名与绑定', url: 'https://docs.python.org/zh-cn/3/reference/executionmodel.html#naming-and-binding' }
    ],
    tutorial: `# 第 15 章：作用域、闭包与递归 🌀

### 变量的查找顺序（LEGB）

Python 查找一个名字时按 **L**ocal（函数内）→ **E**nclosing（外层函数）→ **G**lobal（模块级）→ **B**uiltin（内建）的顺序。函数内赋值默认创建**局部变量**，不会影响外面的同名变量。

### 闭包与 nonlocal

内层函数可以“记住”外层函数的变量，这种组合叫**闭包**。要在内层**修改**外层变量，需声明 \`nonlocal\`：
\`\`\`python
def make_counter():
    count = 0
    def increment():
        nonlocal count   # 声明：count 来自外层，不是新建局部变量
        count += 1
        return count
    return increment

counter = make_counter()
counter()   # 1
counter()   # 2，状态被闭包记住了
\`\`\`
闭包是理解装饰器（第 22 章）的基础。

### 递归：函数调用自己

递归 = **终止条件** + **规模更小的自我调用**：
\`\`\`python
def factorial(n):
    if n <= 1:        # 终止条件，没有它就会无限递归
        return 1
    return n * factorial(n - 1)
\`\`\`
\`factorial(5)\` 展开为 \`5 * 4 * 3 * 2 * 1 = 120\`。凡是“问题可以拆成同构的小问题”的场景（目录树遍历、嵌套数据处理）都适合递归。

### 实战挑战

实现闭包计数器与阶乘函数，输出：
\`\`\`text
1
2
5! = 120
\`\`\``,
    starterCode: `def make_counter():
    count = 0
    def increment():
        # TODO: 用 nonlocal 让 count 加一并返回
        pass
    return increment

counter = make_counter()
print(counter())
print(counter())

def factorial(n):
    # TODO: 递归实现阶乘，注意终止条件
    return 1

print("5! =", factorial(5))
`,
    answerCode: `def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

counter = make_counter()
print(counter())
print(counter())

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print("5! =", factorial(5))
`,
  },
  {
    id: 16,
    title: '异常处理与健壮性',
    difficulty: '进阶',
    estimatedMinutes: 14,
    goals: ['用 try/except 捕获特定异常', '为异常场景提供回退值', '用 is None 判断并分支输出'],
    hint: '在 safe_div 里用 try/except ZeroDivisionError，除零时返回 None；主程序读入两个整数，结果为 None 时输出提示，否则输出算式。',
    expectedOutput: '10 / 2 = 5.0',
    defaultStdin: '10\n2',
    testCases: [
      { id: 'div-ok', title: '10 / 2', stdin: '10\n2', expectedOutput: '10 / 2 = 5.0' },
      { id: 'div-zero', title: '10 / 0', stdin: '10\n0', expectedOutput: 'cannot divide by zero' },
      { id: 'div-three', title: '9 / 3', stdin: '9\n3', expectedOutput: '9 / 3 = 3.0' }
    ],
    sources: [
      { title: '官方教程：错误和异常', url: 'https://docs.python.org/zh-cn/3/tutorial/errors.html' },
      { title: '官方文档：内置异常', url: 'https://docs.python.org/zh-cn/3/library/exceptions.html' }
    ],
    tutorial: `# 第 16 章：异常处理与健壮性 🛡️

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

### 只捕获你能处理的异常

新手常写 \`except:\` 裸捕获一切——这会把拼写错误等真正的 bug 也吞掉，官方明确不推荐。**精确写出异常类型**（如 \`ZeroDivisionError\`、\`ValueError\`、\`KeyError\`、\`FileNotFoundError\`），必要时一次捕获多个：\`except (TypeError, ValueError):\`。

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
    id: 17,
    title: '主动抛出异常与自定义异常类',
    difficulty: '进阶',
    estimatedMinutes: 14,
    goals: ['用 raise 主动抛出异常', '继承 Exception 定义业务异常', '用 except ... as 获取异常消息'],
    hint: '金额非正时 raise ValueError，余额不足时 raise WithdrawError；调用处 except WithdrawError as error 后 print("error:", error)。',
    expectedOutput: '70\nerror: insufficient balance\nerror: amount must be positive',
    sources: [
      { title: '官方教程：抛出异常', url: 'https://docs.python.org/zh-cn/3/tutorial/errors.html#raising-exceptions' },
      { title: '官方教程：用户自定义异常', url: 'https://docs.python.org/zh-cn/3/tutorial/errors.html#user-defined-exceptions' }
    ],
    tutorial: `# 第 17 章：主动抛出异常与自定义异常类 🚨

上一章我们**捕获**异常；这一章反过来——在参数不合法时**主动抛出**异常，让错误尽早暴露，而不是带着脏数据继续跑。

### raise 语句

\`\`\`python
def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("amount must be positive")
    ...
\`\`\`
\`raise 异常类型("说明")\` 立即中断当前函数并向调用方抛出异常。参数校验放在函数**开头**，这种“先验清白再干活”的写法是专业代码的标配。

### 自定义异常类

内建异常不够表达业务含义时，继承 \`Exception\` 定义自己的异常类型（类体常常只需 \`pass\`——类型本身就是信息）：
\`\`\`python
class WithdrawError(Exception):
    pass

raise WithdrawError("insufficient balance")
\`\`\`
调用方就能**精确区分**“程序错误”和“业务拒绝”：
\`\`\`python
try:
    withdraw(100, 200)
except WithdrawError as error:
    print("error:", error)   # 打印异常携带的消息
\`\`\`
\`as error\` 把异常对象绑定到变量，\`print\` 它会显示构造时传入的消息。

### 实战挑战

实现 \`withdraw(balance, amount)\`：金额非正抛 \`ValueError\`，余额不足抛 \`WithdrawError\`，否则返回新余额。依次调用并输出：
\`\`\`text
70
error: insufficient balance
error: amount must be positive
\`\`\``,
    starterCode: `class WithdrawError(Exception):
    pass

def withdraw(balance, amount):
    # TODO: 金额非正抛 ValueError("amount must be positive")
    # TODO: 金额超过余额抛 WithdrawError("insufficient balance")
    return balance - amount

print(withdraw(100, 30))

# TODO: 分别用 try/except 调用 withdraw(100, 200) 与 withdraw(100, -5)
#       并输出 "error: <消息>"
`,
    answerCode: `class WithdrawError(Exception):
    pass

def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("amount must be positive")
    if amount > balance:
        raise WithdrawError("insufficient balance")
    return balance - amount

print(withdraw(100, 30))

try:
    withdraw(100, 200)
except WithdrawError as error:
    print("error:", error)

try:
    withdraw(100, -5)
except ValueError as error:
    print("error:", error)
`,
  },
  {
    id: 18,
    title: '面向对象：类与实例',
    difficulty: '进阶',
    estimatedMinutes: 14,
    goals: ['用 class 定义类并实现 __init__', '通过 self 访问实例属性', '定义并调用实例方法'],
    hint: '在 __init__ 里用 self.name / self.age 保存属性；describe() 返回描述字符串；birthday() 让 self.age 加一。',
    expectedOutput: 'Ada is 18 years old\nAda had a birthday!\nAda is 19 years old',
    sources: [
      { title: '官方教程：类', url: 'https://docs.python.org/zh-cn/3/tutorial/classes.html' },
      { title: '官方教程：类对象与实例对象', url: 'https://docs.python.org/zh-cn/3/tutorial/classes.html#class-objects' }
    ],
    tutorial: `# 第 18 章：面向对象 — 类与实例 🏗️

当“数据”和“操作这些数据的函数”总是成对出现时，就该用**类（class）**把它们打包了。类是创建对象的模板，对象（实例）各自持有独立的数据。

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

- \`__init__\` 是构造器，在创建实例时自动调用。
- 第一个参数 \`self\` 指向实例本身，Python 会自动传入。
- \`self.name = name\`：把参数保存为**实例属性**，之后所有方法都能读写。
- 方法就是定义在类里、第一个参数为 \`self\` 的函数。

### 使用类

\`\`\`python
p = Person("Ada", 18)     # 创建实例，自动调用 __init__
print(p.describe())       # 调用方法
print(p.name)             # 直接访问属性
p.birthday()              # 方法可以修改实例状态
\`\`\`
每个实例的数据互不干扰：\`Person("Bob", 30)\` 有自己的 name 和 age。

### 命名规范

类名用**大驼峰**（\`Person\`、\`BankAccount\`），方法与属性用小写下划线——这也来自官方风格指南 PEP 8。

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
    id: 19,
    title: '继承、多态与魔术方法',
    difficulty: '挑战',
    estimatedMinutes: 15,
    goals: ['用继承派生子类并重写方法', '通过统一接口体现多态', '实现 __str__ 自定义打印'],
    hint: 'Dog、Cat 继承 Animal 并重写 speak()；用 type(animal).__name__ 取类名；在 Animal 里实现 __str__ 让 print 显示自定义文本。',
    expectedOutput: 'Dog says Woof\nCat says Meow\nAnimal(Rex)',
    sources: [
      { title: '官方教程：继承', url: 'https://docs.python.org/zh-cn/3/tutorial/classes.html#inheritance' },
      { title: '官方参考：特殊方法名称', url: 'https://docs.python.org/zh-cn/3/reference/datamodel.html#special-method-names' }
    ],
    tutorial: `# 第 19 章：继承、多态与魔术方法 🧬

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
Dog 没写 \`__init__\`，会自动沿用 Animal 的；需要扩展父类构造时用 \`super().__init__(...)\`。

### 多态

不同子类实现同名方法后，可以用统一方式调用，运行时自动分派到各自的实现——这就是**多态**。调用方不需要写一堆 if 判断类型：
\`\`\`python
for animal in [Dog("Rex"), Cat("Mia")]:
    print(animal.speak())    # 各自输出 Woof / Meow
\`\`\`
\`type(obj).__name__\` 能取到对象的类名。

### 魔术方法

\`__str__\` 决定 \`print(对象)\` 显示的内容。这类以双下划线包裹的方法称为**魔术方法 / dunder**，还有 \`__len__\`（决定 len()）、\`__eq__\`（决定 ==）等——实现它们就能让自定义对象融入 Python 的内建语法。

### 组合优先

并非所有关系都该用继承：Dog **是一种** Animal（继承），而 Car **拥有一个** Engine（组合，属性里放另一个对象）。“是一种”才继承，第 20 章会练习组合。

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
    id: 20,
    title: 'dataclass 与对象组合',
    difficulty: '进阶',
    estimatedMinutes: 14,
    goals: ['用 @dataclass 自动生成构造器', '用 field(default_factory=list) 设置容器默认值', '通过组合让对象持有对象列表'],
    hint: '@dataclass 装饰 Book 与 Cart；Cart 的 books 用 field(default_factory=list)；total() 用生成器 sum(book.price for book in self.books)。',
    expectedOutput: "Book(title='流畅的 Python', price=99.0)\ncount: 2\ntotal: 158.0",
    sources: [
      { title: '官方文档：dataclasses', url: 'https://docs.python.org/zh-cn/3/library/dataclasses.html' },
      { title: '官方文档：typing 模块', url: 'https://docs.python.org/zh-cn/3/library/typing.html' }
    ],
    tutorial: `# 第 20 章：dataclass 与对象组合 🧱

手写 \`__init__\` 保存一堆属性很啰嗦。标准库的 \`@dataclass\` 装饰器能根据**类属性声明**自动生成 \`__init__\`、\`__repr__\`、\`__eq__\`：

\`\`\`python
from dataclasses import dataclass

@dataclass
class Book:
    title: str
    price: float

book = Book("流畅的 Python", 99.0)
print(book)          # Book(title='流畅的 Python', price=99.0)
\`\`\`
每行 \`名字: 类型\` 声明一个字段——类型注解在这里是必须的（第 23 章细讲）。打印实例自动得到清晰的表示，两个字段相同的 Book 也会 \`==\` 相等。

### 可变默认值要用 default_factory

字段默认值若是列表/字典，**不能**直接写 \`books: list = []\`（所有实例会共享同一个列表，这是 Python 著名陷阱）。正确写法：
\`\`\`python
from dataclasses import field
from typing import List

@dataclass
class Cart:
    books: List[Book] = field(default_factory=list)
\`\`\`
\`default_factory=list\` 表示“每个新实例各自调用 list() 造一个新列表”。

### 组合：对象持有对象

Cart **拥有**多本 Book——这就是**组合**。方法直接操作 \`self.books\`：
\`\`\`python
def add(self, book):
    self.books.append(book)

def total(self):
    return sum(book.price for book in self.books)
\`\`\`

### 实战挑战

定义 Book 与 Cart，加入两本书后输出第一本书、数量与总价：
\`\`\`text
Book(title='流畅的 Python', price=99.0)
count: 2
total: 158.0
\`\`\``,
    starterCode: `from dataclasses import dataclass, field
from typing import List

@dataclass
class Book:
    title: str
    price: float

@dataclass
class Cart:
    # TODO: books 字段，默认值用 field(default_factory=list)

    def add(self, book):
        # TODO: 把 book 加入 self.books
        pass

    def total(self):
        # TODO: 返回所有书的价格之和
        return 0

cart = Cart()
cart.add(Book("流畅的 Python", 99.0))
cart.add(Book("Python 编程", 59.0))
print(cart.books[0])
print("count:", len(cart.books))
print("total:", cart.total())
`,
    answerCode: `from dataclasses import dataclass, field
from typing import List

@dataclass
class Book:
    title: str
    price: float

@dataclass
class Cart:
    books: List[Book] = field(default_factory=list)

    def add(self, book):
        self.books.append(book)

    def total(self):
        return sum(book.price for book in self.books)

cart = Cart()
cart.add(Book("流畅的 Python", 99.0))
cart.add(Book("Python 编程", 59.0))
print(cart.books[0])
print("count:", len(cart.books))
print("total:", cart.total())
`,
  },
  {
    id: 21,
    title: '模块与标准库导航',
    difficulty: '进阶',
    estimatedMinutes: 12,
    goals: ['掌握 import 与 from ... import 两种导入', '使用 math 模块的函数与常量', '用 random.seed 让随机结果可复现'],
    hint: 'import math 后用 math.sqrt / math.pi / math.gcd；from random import seed, randint 后 seed(42) 再 randint(1, 6)，用比较表达式验证范围。',
    expectedOutput: 'sqrt(2) = 1.414\npi = 3.14\ngcd: 6\ndice in range: True',
    sources: [
      { title: '官方教程：模块', url: 'https://docs.python.org/zh-cn/3/tutorial/modules.html' },
      { title: '官方文档：math 模块', url: 'https://docs.python.org/zh-cn/3/library/math.html' },
      { title: '官方文档：random 模块', url: 'https://docs.python.org/zh-cn/3/library/random.html' }
    ],
    tutorial: `# 第 21 章：模块与标准库导航 🗺️

Python 的口号是“自带电池”——标准库覆盖数学、随机、文件、网络、日期等几乎所有常用领域。会**查文档、用模块**，比背语法更接近独立开发。

### 两种导入方式

\`\`\`python
import math                      # 之后用 math.sqrt(...) 全名调用
from random import seed, randint # 直接把名字导进来
\`\`\`
- \`import 模块\`：命名空间清晰，推荐为主。
- \`from 模块 import 名字\`：少打字，但注意别覆盖已有名字。
- 避免 \`from 模块 import *\`——官方明确不推荐，来源不明的名字会污染命名空间。

### math 模块速览

- \`math.sqrt(2)\`：平方根；\`math.pi\`：圆周率常量。
- \`math.gcd(12, 18)\`：最大公约数。
- \`math.floor / math.ceil\`：向下 / 向上取整。

### random 与可复现性

\`random.randint(1, 6)\` 掷一个骰子（**双端都含**）。计算机的随机是**伪随机**：\`seed(42)\` 固定种子后，序列完全可复现——写测试、做实验时非常重要。

### 学会自救：查官方文档

内建函数 \`help(math.gcd)\` 与 \`dir(math)\` 能在交互式环境里查看说明与成员清单。养成“先查 docs.python.org”的习惯，是从学习者迈向开发者的关键一步。

### 实战挑战

输出根号 2（保留 3 位小数）、圆周率（保留 2 位）、12 与 18 的最大公约数，再验证骰子结果落在 1~6 内：
\`\`\`text
sqrt(2) = 1.414
pi = 3.14
gcd: 6
dice in range: True
\`\`\``,
    starterCode: `import math
from random import seed, randint

# TODO: 输出 sqrt(2)（用 round 保留 3 位）与 pi（保留 2 位）

# TODO: 输出 math.gcd(12, 18)

seed(42)
# TODO: 掷一次 1~6 的骰子，输出结果是否在 1~6 范围内
`,
    answerCode: `import math
from random import seed, randint

print("sqrt(2) =", round(math.sqrt(2), 3))
print("pi =", round(math.pi, 2))
print("gcd:", math.gcd(12, 18))

seed(42)
value = randint(1, 6)
print("dice in range:", 1 <= value <= 6)
`,
  },
  {
    id: 22,
    title: '装饰器：包装函数的函数',
    difficulty: '挑战',
    estimatedMinutes: 15,
    goals: ['编写并应用一个日志装饰器', '理解 @语法糖等价于重新赋值', '用 functools.wraps 保留原函数信息'],
    hint: 'logged 内部定义 wrapper，先打印 "[calling]" 和 func.__name__ 再调用原函数；wrapper 上加 @functools.wraps(func) 保住函数名。',
    expectedOutput: '[calling] add\n7\nname: add',
    sources: [
      { title: '官方文档：functools.wraps', url: 'https://docs.python.org/zh-cn/3/library/functools.html#functools.wraps' },
      { title: '官方术语表：decorator', url: 'https://docs.python.org/zh-cn/3/glossary.html#term-decorator' }
    ],
    tutorial: `# 第 22 章：装饰器 — 包装函数的函数 🎁

**装饰器**是“接收函数、返回新函数”的高阶函数，用于在**不改动原函数**的前提下追加行为：日志、计时、缓存、权限检查……Web 框架（Flask 的 \`@app.route\`）到处都是它。

\`\`\`python
import functools

def logged(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print("[calling]", func.__name__)
        return func(*args, **kwargs)
    return wrapper

@logged
def add(a, b):
    return a + b
\`\`\`

### 拆解它的工作原理

1. \`@logged\` 只是语法糖，完全等价于 \`add = logged(add)\`。
2. \`logged\` 返回的 \`wrapper\` 是一个**闭包**（第 15 章！），记住了原来的 \`func\`。
3. 之后每次调用 \`add(3, 4)\`，实际执行的是 \`wrapper\`：先打日志，再转调原函数并返回其结果。
4. \`*args, **kwargs\`（第 14 章！）让 wrapper 能包装**任意签名**的函数。

### 为什么要 functools.wraps

包装后 \`add.__name__\` 本来会变成 \`"wrapper"\`，调试和文档都会失真。\`@functools.wraps(func)\` 把原函数的名字、docstring 等元信息拷贝到 wrapper 上——写装饰器的标准姿势。

### 实战挑战

用 \`@logged\` 装饰 \`add\`，调用 \`add(3, 4)\` 并验证函数名未丢失：
\`\`\`text
[calling] add
7
name: add
\`\`\``,
    starterCode: `import functools

def logged(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # TODO: 打印 "[calling]" 和函数名，再调用原函数并返回结果
        return func(*args, **kwargs)
    return wrapper

@logged
def add(a, b):
    return a + b

# TODO: 打印 add(3, 4) 的结果，再输出 "name: <add.__name__>"
`,
    answerCode: `import functools

def logged(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print("[calling]", func.__name__)
        return func(*args, **kwargs)
    return wrapper

@logged
def add(a, b):
    return a + b

print(add(3, 4))
print("name:", add.__name__)
`,
  },
  {
    id: 23,
    title: '类型注解与代码可读性',
    difficulty: '进阶',
    estimatedMinutes: 12,
    goals: ['为函数参数和返回值添加类型注解', '用 Optional 表达“可能为 None”', '理解注解不影响运行、服务于工具与读者'],
    hint: 'average(scores: List[float]) -> Optional[float]；空列表返回 None，否则返回 sum(scores) / len(scores)。',
    expectedOutput: 'average: 90.0\nempty: None',
    sources: [
      { title: '官方文档：typing 类型注解支持', url: 'https://docs.python.org/zh-cn/3/library/typing.html' },
      { title: '官方术语表：annotation', url: 'https://docs.python.org/zh-cn/3/glossary.html#term-annotation' }
    ],
    tutorial: `# 第 23 章：类型注解与代码可读性 🏷️

Python 是动态类型语言，但可以**自愿标注类型**。注解让函数签名一目了然，配合 mypy、Pyright 等工具还能在运行前抓出类型错误——大型项目和求职面试的必备技能。

\`\`\`python
def greet(name: str, times: int = 1) -> str:
    return f"Hi, {name}! " * times
\`\`\`

- \`name: str\`：参数类型写在冒号后。
- \`-> str\`：返回值类型写在箭头后。
- 变量也可以标注：\`count: int = 0\`。

### 容器与 Optional

来自 \`typing\` 模块（Python 3.9+ 也可以直接写小写的 \`list[float]\`，本教程为兼容 3.8 使用 typing 写法）：
\`\`\`python
from typing import List, Dict, Optional

scores: List[float]           # 浮点数列表
ages: Dict[str, int]          # 字符串→整数的字典
result: Optional[float]       # 要么是 float，要么是 None
\`\`\`
\`Optional[float]\` 明确告诉读者“这个值可能不存在”，调用方就知道必须处理 None——比口头约定可靠得多。

### 注解只是“标注”

Python 运行时**不会强制检查**注解——传错类型不会立刻报错。注解的价值在于：给读代码的人看、给 IDE 补全用、给静态检查工具分析用。

### 实战挑战

实现带完整注解的 \`average\`：空列表返回 \`None\`，否则返回平均值：
\`\`\`text
average: 90.0
empty: None
\`\`\``,
    starterCode: `from typing import List, Optional

def average(scores: List[float]) -> Optional[float]:
    # TODO: 空列表返回 None，否则返回平均值
    return None

print("average:", average([80.0, 90.0, 100.0]))
print("empty:", average([]))
`,
    answerCode: `from typing import List, Optional

def average(scores: List[float]) -> Optional[float]:
    if not scores:
        return None
    return sum(scores) / len(scores)

print("average:", average([80.0, 90.0, 100.0]))
print("empty:", average([]))
`,
  },
  {
    id: 24,
    title: '文件读写与 pathlib',
    difficulty: '进阶',
    estimatedMinutes: 14,
    goals: ['用 Path.write_text / read_text 读写文本文件', '用 splitlines 逐行处理内容', '用 unlink 删除文件并确认状态'],
    hint: 'Path("notes.txt") 创建路径对象；write_text 写入时指定 encoding="utf-8"；读回后 splitlines() 逐行打印，最后 unlink() 删除。',
    expectedOutput: 'chars: 23\nline: hello file\nline: second line\nexists: False',
    sources: [
      { title: '官方文档：pathlib', url: 'https://docs.python.org/zh-cn/3/library/pathlib.html' },
      { title: '官方教程：读写文件', url: 'https://docs.python.org/zh-cn/3/tutorial/inputoutput.html#reading-and-writing-files' }
    ],
    tutorial: `# 第 24 章：文件读写与 pathlib 📁

程序的数据要**留得住**，就得写进文件。现代 Python 推荐用 \`pathlib.Path\` 面向对象地操作路径与文件。

### Path 对象

\`\`\`python
from pathlib import Path

path = Path("notes.txt")          # 相对当前目录的路径
path.exists()                     # 文件是否存在
Path("data") / "config.json"      # 用 / 拼接子路径，跨平台安全
\`\`\`

### 一次性读写文本

\`\`\`python
path.write_text("hello file\\nsecond line\\n", encoding="utf-8")
content = path.read_text(encoding="utf-8")
\`\`\`
**永远显式指定 \`encoding="utf-8"\`**——不同操作系统默认编码不同，不写编码是中文乱码问题的头号来源。

### 逐行处理

\`content.splitlines()\` 把整段文本按行拆成列表（自动去掉换行符），配合 for 循环逐行处理——读取配置、解析日志都是这个套路。

### 传统写法：open 与 with

处理大文件时用 \`with open(...)\` 逐行流式读取，\`with\` 会在代码块结束时**自动关闭文件**：
\`\`\`python
with open("notes.txt", encoding="utf-8") as f:
    for line in f:
        ...
\`\`\`

### 实战挑战

写入两行文本，读回后输出总字符数与每一行，最后删除文件并确认：
\`\`\`text
chars: 23
line: hello file
line: second line
exists: False
\`\`\``,
    starterCode: `from pathlib import Path

path = Path("notes.txt")

# TODO: 写入 "hello file\\nsecond line\\n"（utf-8 编码）

# TODO: 读回内容，输出 "chars: <总字符数>"，再逐行输出 "line: <内容>"

# TODO: 删除文件，输出 "exists: <是否存在>"
`,
    answerCode: `from pathlib import Path

path = Path("notes.txt")
path.write_text("hello file\\nsecond line\\n", encoding="utf-8")

content = path.read_text(encoding="utf-8")
print("chars:", len(content))
for line in content.splitlines():
    print("line:", line)

path.unlink()
print("exists:", path.exists())
`,
  },
  {
    id: 25,
    title: 'JSON 与数据序列化',
    difficulty: '进阶',
    estimatedMinutes: 12,
    goals: ['用 json.dumps 把字典转成 JSON 文本', '用 json.loads 解析 JSON 字符串', '理解 ensure_ascii=False 对中文的意义'],
    hint: 'json.dumps(user, ensure_ascii=False) 序列化；json.loads(文本) 得到字典后按键取值；sorted(data.keys()) 输出有序键列表。',
    expectedOutput: '{"name": "Ada", "age": 18, "tags": ["dev", "python"]}\nBob 20\nkeys: [\'age\', \'name\']',
    sources: [
      { title: '官方文档：json 模块', url: 'https://docs.python.org/zh-cn/3/library/json.html' }
    ],
    tutorial: `# 第 25 章：JSON 与数据序列化 🔄

**JSON** 是互联网数据交换的通用格式——调 API、存配置、前后端通信全用它。Python 字典与 JSON 天生一一对应，标准库 \`json\` 模块负责互转。

### 序列化：Python → JSON 文本

\`\`\`python
import json

user = {"name": "Ada", "age": 18, "tags": ["dev", "python"]}
text = json.dumps(user, ensure_ascii=False)
\`\`\`
- \`dumps\` = dump string，把对象转成 JSON 字符串。
- \`ensure_ascii=False\`：让中文原样输出而不是 \`\\uXXXX\` 转义——处理中文数据必加。
- \`indent=2\` 可以输出带缩进的漂亮格式，适合写配置文件。

### 反序列化：JSON 文本 → Python

\`\`\`python
data = json.loads('{"name": "Bob", "age": 20}')
data["name"]    # 'Bob'，解析结果就是普通字典
\`\`\`

### 类型对应关系

JSON 的 object/array/string/number/true/false/null 分别对应 Python 的 dict/list/str/int 或 float/True/False/None。注意 JSON 的键**只能是字符串**，且不支持元组、集合、日期——遇到就要先转换。

### 配合文件

\`json.dump(obj, f)\` / \`json.load(f)\`（不带 s）直接读写文件对象，与上一章的文件知识组合，就是最简单的本地数据库。

### 实战挑战

序列化 user 字典、解析一段 JSON 并输出字段与排序后的键：
\`\`\`text
{"name": "Ada", "age": 18, "tags": ["dev", "python"]}
Bob 20
keys: ['age', 'name']
\`\`\``,
    starterCode: `import json

user = {"name": "Ada", "age": 18, "tags": ["dev", "python"]}

# TODO: 用 dumps（ensure_ascii=False）序列化并输出

# TODO: 解析 '{"name": "Bob", "age": 20}'，输出 name 和 age（空格分隔）

# TODO: 输出 "keys: <排序后的键列表>"
`,
    answerCode: `import json

user = {"name": "Ada", "age": 18, "tags": ["dev", "python"]}
text = json.dumps(user, ensure_ascii=False)
print(text)

data = json.loads('{"name": "Bob", "age": 20}')
print(data["name"], data["age"])
print("keys:", sorted(data.keys()))
`,
  },
  {
    id: 26,
    title: '日期与时间：datetime 模块',
    difficulty: '进阶',
    estimatedMinutes: 12,
    goals: ['创建 date / datetime 对象', '用 timedelta 做日期加减', '用 strftime 自定义格式化输出'],
    hint: 'date(2026, 1, 1) 创建日期；strftime("%A") 输出英文星期名；加 timedelta(days=30) 得到截止日；datetime 再加时分。',
    expectedOutput: '2026-01-01\nweekday: Thursday\ndeadline: 2026-01-31\n2026-01-01 09:30',
    sources: [
      { title: '官方文档：datetime 模块', url: 'https://docs.python.org/zh-cn/3/library/datetime.html' },
      { title: '官方文档：strftime 格式代码', url: 'https://docs.python.org/zh-cn/3/library/datetime.html#strftime-and-strptime-format-codes' }
    ],
    tutorial: `# 第 26 章：日期与时间 — datetime 模块 🕘

处理生日、截止日期、日志时间戳……日期时间是真实项目绕不开的话题。标准库 \`datetime\` 模块提供了四个核心类型：\`date\`（日期）、\`time\`（时间）、\`datetime\`（日期+时间）、\`timedelta\`（时间差）。

### 创建与展示

\`\`\`python
from datetime import date, datetime, timedelta

release = date(2026, 1, 1)
print(release)                # 2026-01-01（ISO 格式）
print(release.year)           # 2026，还有 .month / .day
moment = datetime(2026, 1, 1, 9, 30)   # 再加时、分
\`\`\`
实际项目中用 \`date.today()\` / \`datetime.now()\` 取当前时间（本练习为了输出可验证，使用固定日期）。

### timedelta：日期运算

日期减日期得到 \`timedelta\`；日期加 \`timedelta\` 得到新日期：
\`\`\`python
deadline = release + timedelta(days=30)   # 2026-01-31
\`\`\`
“还有几天到期”“三十天试用期”这类需求就是一行加减法。

### strftime：自定义格式

\`strftime("格式串")\` 按格式代码输出：\`%Y\` 四位年、\`%m\` 月、\`%d\` 日、\`%H:%M\` 时分、\`%A\` 英文星期名。反向解析用 \`strptime(文本, 格式)\`。

### 实战挑战

对 2026 年 1 月 1 日：输出 ISO 日期、星期名、30 天后的截止日，以及 9:30 时刻的格式化输出：
\`\`\`text
2026-01-01
weekday: Thursday
deadline: 2026-01-31
2026-01-01 09:30
\`\`\``,
    starterCode: `from datetime import date, datetime, timedelta

release = date(2026, 1, 1)

# TODO: 输出 release 的 ISO 格式（直接 print 即可）

# TODO: 输出 "weekday: <英文星期名>"（strftime 的 %A）

# TODO: 输出 "deadline: <30 天后的日期>"

# TODO: 创建 2026-01-01 09:30 的 datetime，按 "%Y-%m-%d %H:%M" 输出
`,
    answerCode: `from datetime import date, datetime, timedelta

release = date(2026, 1, 1)
print(release)
print("weekday:", release.strftime("%A"))

deadline = release + timedelta(days=30)
print("deadline:", deadline)

moment = datetime(2026, 1, 1, 9, 30)
print(moment.strftime("%Y-%m-%d %H:%M"))
`,
  },
  {
    id: 27,
    title: '正则表达式：re 模块',
    difficulty: '挑战',
    estimatedMinutes: 16,
    goals: ['用 findall 提取全部匹配', '用 search 与分组捕获结构化信息', '用 sub 做模式替换'],
    hint: 'r"order-(\\d+)" 中的括号是捕获组，findall 只返回组内内容；search 返回匹配对象后用 .group(1) 取组；sub(r"\\d+", "#", 文本) 替换所有数字串。',
    expectedOutput: "orders: ['42', '7']\nyear: 2026\ncall # then #",
    sources: [
      { title: '官方文档：re 模块', url: 'https://docs.python.org/zh-cn/3/library/re.html' },
      { title: '官方指南：正则表达式 HOWTO', url: 'https://docs.python.org/zh-cn/3/howto/regex.html' }
    ],
    tutorial: `# 第 27 章：正则表达式 — re 模块 🔍

**正则表达式**是描述文本模式的迷你语言：“order- 后面跟一串数字”“yyyy-mm-dd 形状的日期”。从日志提取数据、校验输入格式、批量替换，正则是文本处理的瑞士军刀。

### 常用元字符

- \`\\d\`：一个数字；\`\\w\`：字母/数字/下划线；\`\\s\`：空白。
- \`+\`：前面的东西出现 1 次以上；\`*\`：0 次以上；\`?\`：0 或 1 次。
- \`{4}\`：恰好 4 次，如 \`\\d{4}\` 匹配四位数字。
- \`(...)\`：**捕获组**，把匹配中你关心的部分抓出来。

**永远用原始字符串 \`r"..."\` 写正则**——r 前缀让反斜杠不被 Python 转义，否则 \`\\d\` 要写成 \`\\\\d\`。

### 三大常用函数

\`\`\`python
import re

text = "order-42 shipped, order-7 pending"
re.findall(r"order-(\\d+)", text)   # ['42', '7']：所有匹配的组内容
match = re.search(r"(\\d{4})-(\\d{2})", "date 2026-07")
match.group(1)                      # '2026'：第 1 个捕获组
re.sub(r"\\d+", "#", "call 123")    # 'call #'：把匹配替换掉
\`\`\`
\`search\` 找不到时返回 \`None\`，使用前务必 \`if match:\` 判断——这正是第 23 章 Optional 思维的实战。

### 实战挑战

从订单文本中提取所有订单号、抓出日期的年份，并把数字串替换为 #：
\`\`\`text
orders: ['42', '7']
year: 2026
call # then #
\`\`\``,
    starterCode: `import re

text = "order-42 shipped on 2026-07-27, order-7 pending"

# TODO: 用 findall 提取所有订单号，输出 "orders: <列表>"

# TODO: 用 search 匹配 yyyy-mm-dd，输出 "year: <第一组>"

# TODO: 用 sub 把 "call 123 then 45" 中的数字串换成 "#"
`,
    answerCode: `import re

text = "order-42 shipped on 2026-07-27, order-7 pending"

ids = re.findall(r"order-(\\d+)", text)
print("orders:", ids)

match = re.search(r"(\\d{4})-(\\d{2})-(\\d{2})", text)
if match:
    print("year:", match.group(1))

print(re.sub(r"\\d+", "#", "call 123 then 45"))
`,
  },
  {
    id: 28,
    title: '效率工具箱：collections 与 itertools',
    difficulty: '挑战',
    estimatedMinutes: 14,
    goals: ['用 Counter 一行完成计数统计', '用 defaultdict 优雅地分组', '用 itertools.product 生成笛卡尔积'],
    hint: 'Counter("mississippi").most_common(2) 取出现最多的两项；defaultdict(list) 允许直接 groups[key].append；product("AB", "12") 生成所有组合。',
    expectedOutput: "[('i', 4), ('s', 4)]\n{'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry']}\n[('A', '1'), ('A', '2'), ('B', '1'), ('B', '2')]",
    sources: [
      { title: '官方文档：collections 容器数据类型', url: 'https://docs.python.org/zh-cn/3/library/collections.html' },
      { title: '官方文档：itertools 迭代器函数', url: 'https://docs.python.org/zh-cn/3/library/itertools.html' }
    ],
    tutorial: `# 第 28 章：效率工具箱 — collections 与 itertools ⚙️

这两个标准库模块是 Python 老手的“效率外挂”：很多你要写十行的逻辑，它们一行搞定。

### Counter：专业计数器

\`\`\`python
from collections import Counter

counts = Counter("mississippi")     # 统计每个字符出现次数
counts["s"]                          # 4
counts.most_common(2)                # [('i', 4), ('s', 4)]，出现最多的前两名
\`\`\`
还记得第 10 章用 \`get(k, 0) + 1\` 手动累计吗？Counter 就是它的工业级封装，并列时按**首次出现顺序**排。

### defaultdict：带默认值的字典

普通字典访问不存在的键会 KeyError。\`defaultdict(list)\` 在键缺失时自动创建一个空列表，让“分组”代码干净利落：
\`\`\`python
from collections import defaultdict

groups = defaultdict(list)
for word in ["apple", "avocado", "banana"]:
    groups[word[0]].append(word)    # 按首字母分组，无需判断键是否存在
\`\`\`
打印时用 \`dict(groups)\` 转回普通字典更清晰。

### itertools.product：笛卡尔积

\`product("AB", "12")\` 生成两组元素的**所有组合**——枚举测试参数、生成坐标网格的利器。itertools 家族还有 \`combinations\`（组合）、\`permutations\`（排列）、\`chain\`（串联多个序列）等。

### 实战挑战

统计 mississippi 的高频字符、按首字母给单词分组、生成 AB×12 的组合：
\`\`\`text
[('i', 4), ('s', 4)]
{'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry']}
[('A', '1'), ('A', '2'), ('B', '1'), ('B', '2')]
\`\`\``,
    starterCode: `from collections import Counter, defaultdict
from itertools import product

# TODO: 用 Counter 统计 "mississippi"，输出 most_common(2)

# TODO: 用 defaultdict(list) 把 ["apple", "avocado", "banana", "blueberry"]
#       按首字母分组，输出 dict(groups)

# TODO: 输出 list(product("AB", "12"))
`,
    answerCode: `from collections import Counter, defaultdict
from itertools import product

counts = Counter("mississippi")
print(counts.most_common(2))

groups = defaultdict(list)
for word in ["apple", "avocado", "banana", "blueberry"]:
    groups[word[0]].append(word)
print(dict(groups))

print(list(product("AB", "12")))
`,
  },
  {
    id: 29,
    title: '测试思维：assert 与自检代码',
    difficulty: '进阶',
    estimatedMinutes: 14,
    goals: ['用 assert 表达“此处必须成立”', '为函数编写覆盖边界的测试用例', '体会“先测试后交付”的开发流程'],
    hint: 'slugify 依次 strip()、lower()、replace(" ", "-")；run_tests 里写三条 assert，全部通过后打印 "all tests passed"。',
    expectedOutput: 'all tests passed\nlearn-python-now',
    sources: [
      { title: '官方参考：assert 语句', url: 'https://docs.python.org/zh-cn/3/reference/simple_stmts.html#the-assert-statement' },
      { title: '官方文档：unittest 单元测试框架', url: 'https://docs.python.org/zh-cn/3/library/unittest.html' }
    ],
    tutorial: `# 第 29 章：测试思维 — assert 与自检代码 ✅

独立开发者和初学者最大的区别之一：**代码写完不算完，测过才算完**。测试不是额外负担，而是你敢重构、敢发布的底气。

### assert 语句

\`assert 条件, "说明"\`：条件成立时安静通过，不成立时抛出 \`AssertionError\`：
\`\`\`python
def slugify(title):
    return title.strip().lower().replace(" ", "-")

assert slugify("Hello World") == "hello-world"
\`\`\`
一条 assert 就是一个最小的测试：**给定输入，断言输出**。

### 测试要覆盖什么

- **正常路径**：最典型的输入。
- **边界情况**：空字符串、前后带空格、只有一个词……bug 最爱藏在边界里。
- **回归**：每次修完 bug，就为它补一条测试，同一个坑不摔两次。

\`\`\`python
def run_tests():
    assert slugify("Hello World") == "hello-world"
    assert slugify("  Python  ") == "python"      # 边界：首尾空格
    assert slugify("a b c") == "a-b-c"            # 多个空格分隔
    print("all tests passed")
\`\`\`

### 通往专业测试框架

真实项目用 \`unittest\`（标准库）或 \`pytest\`（社区事实标准）组织测试：自动发现用例、失败时精确报告、统计覆盖率。它们的核心思想与你今天写的 assert 完全一致。

### 实战挑战

实现 \`slugify\`（去首尾空格 → 转小写 → 空格换连字符），先跑通三条测试，再处理新输入：
\`\`\`text
all tests passed
learn-python-now
\`\`\``,
    starterCode: `def slugify(title):
    # TODO: 去首尾空格、转小写、把空格替换为 "-"
    return title

def run_tests():
    assert slugify("Hello World") == "hello-world"
    assert slugify("  Python  ") == "python"
    assert slugify("a b c") == "a-b-c"
    print("all tests passed")

run_tests()
print(slugify("Learn Python Now"))
`,
    answerCode: `def slugify(title):
    return title.strip().lower().replace(" ", "-")

def run_tests():
    assert slugify("Hello World") == "hello-world"
    assert slugify("  Python  ") == "python"
    assert slugify("a b c") == "a-b-c"
    print("all tests passed")

run_tests()
print(slugify("Learn Python Now"))
`,
  },
  {
    id: 30,
    title: '综合实战一：词频统计',
    difficulty: '挑战',
    estimatedMinutes: 18,
    goals: ['用 split 切分并用字典累计词频', '用 sorted 配合多关键字排序', '按次数降序、同频按字母升序输出'],
    hint: '用 counts.get(word, 0) + 1 累计；排序键用 lambda kv: (-kv[1], kv[0]) 实现“次数降序、字母升序”；逐行输出 "word: count"。',
    expectedOutput: 'the: 3\ncat: 2\nmat: 1\non: 1\nsat: 1',
    defaultStdin: 'the cat sat on the mat the cat',
    testCases: [
      { id: 'wc-basic', title: '多词句子', stdin: 'the cat sat on the mat the cat', expectedOutput: 'the: 3\ncat: 2\nmat: 1\non: 1\nsat: 1' },
      { id: 'wc-single', title: '单个单词', stdin: 'hello', expectedOutput: 'hello: 1' },
      { id: 'wc-tie', title: '同频排序', stdin: 'b a b a c', expectedOutput: 'a: 2\nb: 2\nc: 1' }
    ],
    sources: [
      { title: '官方文档：字典类型', url: 'https://docs.python.org/zh-cn/3/library/stdtypes.html#mapping-types-dict' },
      { title: '官方指南：排序技术', url: 'https://docs.python.org/zh-cn/3/howto/sorting.html' }
    ],
    tutorial: `# 第 30 章：综合实战一 — 词频统计 🏁

从本章起进入**项目阶段**：不再练习单个语法点，而是把学过的知识组合成完整程序。第一个项目综合运用字符串、字典、排序与 lambda，实现经典的**词频统计**。

### 思路拆解

1. 用 \`line.split()\` 把一行文本切成单词列表。
2. 用字典累计：\`counts[word] = counts.get(word, 0) + 1\`。
3. 排序输出：希望**次数多的在前，次数相同按字母升序**。可用元组作为排序键：
\`\`\`python
sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
\`\`\`
其中 \`-kv[1]\` 让次数降序，\`kv[0]\` 让同频时按单词升序。**元组作复合排序键**是非常高频的实战技巧。

### 输出格式

逐行输出 \`单词: 次数\`，例如 \`the: 3\`。

### 想一想

- 如果要忽略大小写（The 和 the 算同一个词），在哪一步加 \`lower()\`？
- 学过第 28 章后，你能用 \`Counter\` 把统计部分换成一行吗？（注意 \`most_common\` 的同频顺序与本题要求不同，排序仍需自己写。）

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
  {
    id: 31,
    title: '综合实战二：命令驱动的待办清单',
    difficulty: '挑战',
    estimatedMinutes: 20,
    goals: ['解析 add / done / list 三种文本命令', '用字典列表维护待办状态', '按状态渲染清单输出'],
    hint: 'sys.stdin.read().splitlines() 读入全部命令；line.split(" ", 1) 只切一刀分出命令与参数；done 的序号要减 1 转成下标；list 时用 "x" 或空格渲染完成标记。',
    expectedOutput: 'added: buy milk\nadded: write code\ndone: buy milk\n[x] 1. buy milk\n[ ] 2. write code',
    defaultStdin: 'add buy milk\nadd write code\ndone 1\nlist',
    testCases: [
      { id: 'todo-basic', title: '添加两项完成一项', stdin: 'add buy milk\nadd write code\ndone 1\nlist', expectedOutput: 'added: buy milk\nadded: write code\ndone: buy milk\n[x] 1. buy milk\n[ ] 2. write code' },
      { id: 'todo-single', title: '单项清单', stdin: 'add read book\nlist', expectedOutput: 'added: read book\n[ ] 1. read book' },
      { id: 'todo-second', title: '完成第二项', stdin: 'add a\nadd b\ndone 2\nlist', expectedOutput: 'added: a\nadded: b\ndone: b\n[ ] 1. a\n[x] 2. b' }
    ],
    sources: [
      { title: '官方文档：sys.stdin', url: 'https://docs.python.org/zh-cn/3/library/sys.html#sys.stdin' },
      { title: '官方文档：str.split', url: 'https://docs.python.org/zh-cn/3/library/stdtypes.html#str.split' }
    ],
    tutorial: `# 第 31 章：综合实战二 — 命令驱动的待办清单 📋

命令行工具的核心模式：**读取命令 → 解析 → 更新状态 → 反馈**。本章实现一个支持三种命令的待办清单，这个模式与真实的 CLI 工具、聊天机器人、游戏主循环完全同构。

### 命令协议

- \`add <内容>\`：添加待办，回应 \`added: <内容>\`。
- \`done <序号>\`：把第 n 项标记完成，回应 \`done: <内容>\`。
- \`list\`：逐行输出 \`[x] 1. 内容\`（完成）或 \`[ ] 2. 内容\`（未完成）。

### 关键技巧

**一次读入所有行**（比循环 input() 更好处理结尾）：
\`\`\`python
import sys
for line in sys.stdin.read().splitlines():
    ...
\`\`\`

**只切一刀**：\`"add buy milk".split(" ", 1)\` 得到 \`['add', 'buy milk']\`——第二个参数限制切分次数，保住带空格的内容。

**用字典表示一条待办**：
\`\`\`python
todos.append({"text": "buy milk", "done": False})
\`\`\`
比两个平行列表更清晰，也是通往第 20 章 dataclass 建模的过渡形态。

**序号转下标**：用户说的“第 1 项”是列表下标 0，记得减一。

### 渲染清单

\`\`\`python
for i, todo in enumerate(todos, start=1):
    mark = "x" if todo["done"] else " "
    print(f"[{mark}] {i}. {todo['text']}")
\`\`\`
\`A if 条件 else B\` 是条件表达式（三元），一行完成两态取值。

### 实战挑战

按协议处理标准输入中的命令序列，对默认输入输出：
\`\`\`text
added: buy milk
added: write code
done: buy milk
[x] 1. buy milk
[ ] 2. write code
\`\`\``,
    starterCode: `import sys

todos = []

for line in sys.stdin.read().splitlines():
    parts = line.split(" ", 1)
    command = parts[0]
    # TODO: 处理 add：追加 {"text": ..., "done": False} 并输出 added: ...
    # TODO: 处理 done：按序号标记完成并输出 done: <内容>
    # TODO: 处理 list：逐行输出 [x]/[ ] 序号. 内容
`,
    answerCode: `import sys

todos = []

for line in sys.stdin.read().splitlines():
    parts = line.split(" ", 1)
    command = parts[0]
    if command == "add":
        todos.append({"text": parts[1], "done": False})
        print(f"added: {parts[1]}")
    elif command == "done":
        index = int(parts[1]) - 1
        todos[index]["done"] = True
        print(f"done: {todos[index]['text']}")
    elif command == "list":
        for i, todo in enumerate(todos, start=1):
            mark = "x" if todo["done"] else " "
            print(f"[{mark}] {i}. {todo['text']}")
`,
  },
  {
    id: 32,
    title: '综合实战三：学生成绩分析器',
    difficulty: '挑战',
    estimatedMinutes: 20,
    goals: ['解析多行 "名字 分数" 记录', '计算人数、平均分与最高分', '按分数降序、同分按名字升序输出排行'],
    hint: '每行 split() 出名字和分数并转 int；平均分用 f"{average:.1f}" 保留一位小数；max(records, key=lambda item: item[1]) 找最高分；排行键 (-item[1], item[0])。',
    expectedOutput: 'count: 4\naverage: 84.8\ntop: Ada 92\nAda: 92\nCid: 92\nBob: 85\nDora: 70',
    defaultStdin: 'Ada 92\nBob 85\nCid 92\nDora 70',
    testCases: [
      { id: 'score-basic', title: '四名学生', stdin: 'Ada 92\nBob 85\nCid 92\nDora 70', expectedOutput: 'count: 4\naverage: 84.8\ntop: Ada 92\nAda: 92\nCid: 92\nBob: 85\nDora: 70' },
      { id: 'score-single', title: '单名学生', stdin: 'Solo 100', expectedOutput: 'count: 1\naverage: 100.0\ntop: Solo 100\nSolo: 100' },
      { id: 'score-two', title: '两名学生', stdin: 'Bob 70\nAda 90', expectedOutput: 'count: 2\naverage: 80.0\ntop: Ada 90\nAda: 90\nBob: 70' }
    ],
    sources: [
      { title: '官方文档：max 与 key 参数', url: 'https://docs.python.org/zh-cn/3/library/functions.html#max' },
      { title: '官方教程：输入与输出格式化', url: 'https://docs.python.org/zh-cn/3/tutorial/inputoutput.html' }
    ],
    tutorial: `# 第 32 章：综合实战三 — 学生成绩分析器 📊

数据分析的最小闭环：**解析原始数据 → 统计聚合 → 排序展示**。Excel 干的事，你现在可以用 20 行 Python 完成。

### 解析记录

每行形如 \`Ada 92\`。切分后注意：分数读进来是字符串，要转 \`int\`；用**元组列表**存放全部记录：
\`\`\`python
records = []
for line in sys.stdin.read().splitlines():
    if not line.strip():        # 跳过空行，健壮性习惯
        continue
    name, score_text = line.split()
    records.append((name, int(score_text)))
\`\`\`
\`name, score_text = line.split()\` 是**序列解包**：右边恰好两段时直接落到两个变量上。

### 统计聚合

- 人数：\`len(records)\`。
- 平均分：生成器表达式 \`sum(score for _, score in records) / len(records)\`；下划线 \`_\` 惯例表示“这个变量不用”。
- 输出保留一位小数：\`f"{average:.1f}"\`——格式说明 \`:.1f\` 上一次在第 11 章见过。
- 最高分：\`max(records, key=lambda item: item[1])\`，返回**整条记录**，解包出名字和分数。

### 排行输出

与第 30 章同一招——复合排序键 \`(-分数, 名字)\`：分数降序，同分按名字升序。

### 实战挑战

对默认输入输出：
\`\`\`text
count: 4
average: 84.8
top: Ada 92
Ada: 92
Cid: 92
Bob: 85
Dora: 70
\`\`\``,
    starterCode: `import sys

records = []
# TODO: 逐行解析 "名字 分数"，存为 (name, score) 元组

# TODO: 输出 count、average（保留 1 位小数）、top（最高分记录）

# TODO: 按分数降序、同分按名字升序输出 "名字: 分数"
`,
    answerCode: `import sys

records = []
for line in sys.stdin.read().splitlines():
    if not line.strip():
        continue
    name, score_text = line.split()
    records.append((name, int(score_text)))

average = sum(score for _, score in records) / len(records)
print(f"count: {len(records)}")
print(f"average: {average:.1f}")

top_name, top_score = max(records, key=lambda item: item[1])
print(f"top: {top_name} {top_score}")

for name, score in sorted(records, key=lambda item: (-item[1], item[0])):
    print(f"{name}: {score}")
`,
  },
  {
    id: 33,
    title: '毕业项目：银行账户系统',
    difficulty: '挑战',
    estimatedMinutes: 25,
    goals: ['用类封装账户状态与操作', '用自定义异常表达业务规则', '实现命令循环并统一处理错误'],
    hint: 'Account 类维护 balance 与 history；deposit/withdraw 校验参数并 raise；主循环解析命令，用一个 try/except (ValueError, InsufficientFunds) 统一打印 error。',
    expectedOutput: 'deposit ok, balance=100\nwithdraw ok, balance=70\nerror: balance 70 < 500\nbalance=70\nhistory: +100 -30',
    defaultStdin: 'deposit 100\nwithdraw 30\nwithdraw 500\nbalance\nhistory',
    testCases: [
      { id: 'bank-basic', title: '存取与超额', stdin: 'deposit 100\nwithdraw 30\nwithdraw 500\nbalance\nhistory', expectedOutput: 'deposit ok, balance=100\nwithdraw ok, balance=70\nerror: balance 70 < 500\nbalance=70\nhistory: +100 -30' },
      { id: 'bank-invalid', title: '非法金额', stdin: 'deposit 50\ndeposit -5\nbalance', expectedOutput: 'deposit ok, balance=50\nerror: amount must be positive\nbalance=50' },
      { id: 'bank-empty', title: '空户透支', stdin: 'withdraw 10\ndeposit 20\nhistory', expectedOutput: 'error: balance 0 < 10\ndeposit ok, balance=20\nhistory: +20' }
    ],
    sources: [
      { title: '官方教程：类', url: 'https://docs.python.org/zh-cn/3/tutorial/classes.html' },
      { title: '官方教程：错误和异常', url: 'https://docs.python.org/zh-cn/3/tutorial/errors.html' }
    ],
    tutorial: `# 第 33 章：毕业项目 — 银行账户系统 🎓

最后一战！这个项目把整个课程串成一条线：**类与封装**（18 章）、**自定义异常**（17 章）、**命令解析**（31 章）、**f-string 渲染**（11 章）。完成它，你就具备了独立设计小型程序的全部要素。

### 设计：状态收进类里

\`\`\`python
class InsufficientFunds(Exception):
    pass

class Account:
    def __init__(self, owner):
        self.owner = owner
        self.balance = 0
        self.history = []
\`\`\`
余额与流水只能通过方法修改——**封装**保证状态永远合法。

### 业务规则用异常表达

\`\`\`python
def withdraw(self, amount):
    if amount <= 0:
        raise ValueError("amount must be positive")
    if amount > self.balance:
        raise InsufficientFunds(f"balance {self.balance} < {amount}")
    self.balance -= amount
    self.history.append(f"-{amount}")
\`\`\`
方法只负责“正确地做或明确地拒绝”，**怎么向用户报错是调用方的事**——这就是分层的雏形。

### 命令循环与统一错误处理

主循环解析四种命令：\`deposit n\`、\`withdraw n\`、\`balance\`、\`history\`。把每条命令的处理包进**一个** try/except，任何业务拒绝都统一输出 \`error: <消息>\`，程序继续处理后续命令而不是崩溃：
\`\`\`python
try:
    if command == "deposit":
        account.deposit(int(parts[1]))
        print(f"deposit ok, balance={account.balance}")
    ...
except (ValueError, InsufficientFunds) as error:
    print("error:", error)
\`\`\`

### 毕业寄语

到这里，你已经掌握了语法、数据结构、函数式技巧、面向对象、标准库与测试思维。下一步建议：把本章程序扩展成支持多账户、用 JSON（25 章）持久化到文件（24 章）、再用 assert（29 章）写一组测试——那就是一个真正独立完成的小项目了。

### 实战挑战

对默认输入输出：
\`\`\`text
deposit ok, balance=100
withdraw ok, balance=70
error: balance 70 < 500
balance=70
history: +100 -30
\`\`\``,
    starterCode: `import sys

class InsufficientFunds(Exception):
    pass

class Account:
    def __init__(self, owner):
        self.owner = owner
        self.balance = 0
        self.history = []

    def deposit(self, amount):
        # TODO: 金额非正抛 ValueError("amount must be positive")
        #       否则更新余额并记录 f"+{amount}"
        pass

    def withdraw(self, amount):
        # TODO: 金额非正抛 ValueError；超过余额抛
        #       InsufficientFunds(f"balance {self.balance} < {amount}")
        #       否则更新余额并记录 f"-{amount}"
        pass

account = Account("Ada")
for line in sys.stdin.read().splitlines():
    parts = line.split()
    if not parts:
        continue
    command = parts[0]
    # TODO: 在 try/except 中处理 deposit/withdraw/balance/history 四种命令
`,
    answerCode: `import sys

class InsufficientFunds(Exception):
    pass

class Account:
    def __init__(self, owner):
        self.owner = owner
        self.balance = 0
        self.history = []

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance += amount
        self.history.append(f"+{amount}")

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        if amount > self.balance:
            raise InsufficientFunds(f"balance {self.balance} < {amount}")
        self.balance -= amount
        self.history.append(f"-{amount}")

account = Account("Ada")
for line in sys.stdin.read().splitlines():
    parts = line.split()
    if not parts:
        continue
    command = parts[0]
    try:
        if command == "deposit":
            account.deposit(int(parts[1]))
            print(f"deposit ok, balance={account.balance}")
        elif command == "withdraw":
            account.withdraw(int(parts[1]))
            print(f"withdraw ok, balance={account.balance}")
        elif command == "balance":
            print(f"balance={account.balance}")
        elif command == "history":
            print("history:", " ".join(account.history))
    except (ValueError, InsufficientFunds) as error:
        print("error:", error)
`,
  },
];
