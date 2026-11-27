from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


class TodoTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.db = Path(directory.name) / "test.sqlite3"

    def cli(self, *args):
        return subprocess.run(
            [sys.executable, "-X", "utf8", str(Path(__file__).with_name("todo.py")),
             "--db", str(self.db), *args],
            capture_output=True, text=True, encoding="utf-8", timeout=10,
        )

    def test_add_and_complete_persist_between_processes(self):
        self.assertEqual(self.cli("list").stdout.strip(), "清单为空。")
        self.assertEqual(self.cli("add", "复习 Python").returncode, 0)
        self.assertIn("[ ] 1. 复习 Python", self.cli("list").stdout)
        self.assertEqual(self.cli("done", "1").returncode, 0)
        self.assertIn("[x] 1. 复习 Python", self.cli("list").stdout)

    def test_deleting_a_task_does_not_reuse_its_id(self):
        self.assertEqual(self.cli("add", "first").returncode, 0)
        self.assertEqual(self.cli("remove", "1").returncode, 0)
        self.assertEqual(self.cli("add", "second").returncode, 0)
        self.assertEqual(self.cli("list").stdout.strip(), "[ ] 2. second")

    def test_invalid_arguments_do_not_change_the_list(self):
        self.assertEqual(self.cli("add", "keep me").returncode, 0)
        self.assertEqual(self.cli("add", " ").returncode, 2)
        result = self.cli("done", "0")
        self.assertEqual(result.returncode, 2)
        self.assertIn("找不到编号", result.stderr)
        self.assertEqual(self.cli("list").stdout.strip(), "[ ] 1. keep me")

    def test_damaged_database_is_not_overwritten(self):
        self.db.write_bytes(b"not a database")
        result = self.cli("list")
        self.assertEqual(result.returncode, 1)
        self.assertIn("无法读取或保存清单", result.stderr)
        self.assertEqual(self.db.read_bytes(), b"not a database")
