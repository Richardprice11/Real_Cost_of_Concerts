import re
from pathlib import Path

DIV = "d" + "i" + "v"
root = Path(__file__).resolve().parent.parent
pattern_open = re.compile(r"<motion(\s)")
pattern_close = re.compile(r"</motion>")

for path in root.rglob("*.tsx"):
    t = path.read_text(encoding="utf-8")
    new = pattern_close.sub(f"</{DIV}>", pattern_open.sub(f"<{DIV}\\1", t))
    if new != t:
        path.write_text(new, encoding="utf-8")
        print(path.relative_to(root))
