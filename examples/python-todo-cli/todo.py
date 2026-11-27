import argparse
from contextlib import closing
from pathlib import Path
import sqlite3
import sys


DEFAULT_DB = Path(__file__).resolve().with_name("tasks.sqlite3")


def parse_args():
    parser = argparse.ArgumentParser(description="管理保存在本机的待办清单")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB, help="指定数据库文件")
    commands = parser.add_subparsers(dest="command", required=True)
    add = commands.add_parser("add", help="添加一项待办")
    add.add_argument("title", help="待办内容，包含空格时使用引号")
    commands.add_parser("list", help="列出所有待办")
    for name, description in (("done", "标记完成"), ("remove", "删除一项")):
        command = commands.add_parser(name, help=description)
        command.add_argument("id", type=int, help="list 显示的编号")
    return parser.parse_args()


def run_command(db, args):
    if args.command == "list":
        rows = db.execute("SELECT id, title, done FROM tasks ORDER BY id").fetchall()
        lines = [f"[{'x' if done else ' '}] {task_id}. {title}" for task_id, title, done in rows]
        return "\n".join(lines) or "清单为空。"

    if args.command == "add":
        title = args.title.strip()
        if not title or any(character in title for character in "\r\n"):
            raise ValueError("待办内容需要是一行非空文字。")
        task = db.execute("INSERT INTO tasks (title) VALUES (?)", (title,))
        return f"已添加 {task.lastrowid}. {title}"

    if not 0 < args.id < 2**63:
        raise ValueError(f"找不到编号 {args.id}。用 list 查看现有编号。")
    if args.command == "done":
        task = db.execute("UPDATE tasks SET done = 1 WHERE id = ?", (args.id,))
    else:
        task = db.execute("DELETE FROM tasks WHERE id = ?", (args.id,))
    if not task.rowcount:
        raise ValueError(f"找不到编号 {args.id}。用 list 查看现有编号。")
    return f"已{'完成' if args.command == 'done' else '删除'} {args.id}。"


def main():
    args = parse_args()
    try:
        with closing(sqlite3.connect(args.db)) as db, db:
            db.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    done INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1))
                )
            """)
            message = run_command(db, args)
    except ValueError as error:
        print(error, file=sys.stderr)
        return 2
    except sqlite3.Error as error:
        print(f"无法读取或保存清单（{args.db}）：{error}", file=sys.stderr)
        return 1
    print(message)
    return 0


if __name__ == "__main__":
    sys.exit(main())
