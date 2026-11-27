# Python 待办清单

第 31 章的待办清单扩展成了终端项目。使用 Python 3.8 或更新版本和自带的标准库。解压后，在这一目录打开终端。

```sh
python3 todo.py add "复习 Python"
python3 todo.py list
python3 todo.py done 1
python3 todo.py list
```

首次运行会在 `todo.py` 旁创建 `tasks.sqlite3`。再次运行还能看到上次保存的待办。用 `python3 todo.py remove 1` 删除第 1 项。也可以在子命令前加 `--db demo.sqlite3`，用一份单独的清单练手。Windows 上可把 `python3` 换成 `py -3`。

```sh
python3 -m unittest -v
```

`todo.py` 用 `argparse` 解析命令，用 `sqlite3` 读写待办。与网页版逐行读输入的练习一样，程序先识别命令、再更新状态，最后输出结果。这里用数据库编号定位待办，删除一项后其他编号仍然有效。测试使用临时清单。

试着新增 `list --open`，先给测试补一个场景：清单有两项且其中一项已完成时，命令只显示未完成的那项。
