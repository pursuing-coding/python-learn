"""Build the course download or test the exact archive learners receive."""

import argparse
from pathlib import Path
import subprocess
import sys
import tempfile
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
PROJECT = "python-todo-cli"
SOURCE = ROOT / "examples" / PROJECT
ARCHIVE = ROOT / "public" / "downloads" / (PROJECT + ".zip")
FILES = ("README.md", "todo.py", "test_todo.py")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    sources = {f"{PROJECT}/{name}": (SOURCE / name).read_bytes() for name in FILES}
    if not args.check:
        ARCHIVE.parent.mkdir(parents=True, exist_ok=True)
        with ZipFile(ARCHIVE, "w") as archive:
            for name, content in sources.items():
                archive.writestr(ZipInfo(name), content, compress_type=ZIP_DEFLATED)
    with ZipFile(ARCHIVE) as archive, tempfile.TemporaryDirectory() as extracted:
        if archive.namelist() != list(sources) or any(archive.read(name) != data for name, data in sources.items()):
            raise SystemExit("Project archive is out of date. Run python3 scripts/package-project.py to rebuild it.")
        archive.extractall(extracted)
        subprocess.run([sys.executable, "-m", "unittest", "-v"], cwd=Path(extracted) / PROJECT, check=True)
    print(f"Verified {ARCHIVE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
