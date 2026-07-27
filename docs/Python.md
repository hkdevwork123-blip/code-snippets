---
outline: deep
---

# Python

He's not the messiah, he's a very naughty boy! Created by Guido van Rossum and named after the BBC comedy series Monty Python, Python is clean, versatile and great for beginners. It does many jobs well, from data science to web development and is one of my favorite languages.

## The Basics

Python reads almost like English and uses indentation instead of braces to define blocks:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("world"))
```

A few things worth knowing early:

- **Everything is an object** - strings, numbers, functions, even classes.
- **Dynamic typing** - you don't declare types, but you *can* add type hints (`name: str`) which tools like `mypy` and your editor use for checking.
- **f-strings** - `f"..."` is the cleanest way to build strings with variables in them.

### Core Data Structures

```python
my_list = [1, 2, 3]              # ordered, mutable
my_tuple = (1, 2, 3)            # ordered, immutable
my_set = {1, 2, 3}             # unique values, unordered
my_dict = {"key": "value"}    # key/value pairs (like a JS object)
```

::: tip
A dict in Python is essentially an object in JavaScript.
:::

### Comprehensions

A very Pythonic way to build a list (or dict/set) in one line:

```python
squares = [n * n for n in range(10)]
evens = [n for n in range(20) if n % 2 == 0]
```

## Managing Environments with uv

[`uv`](https://github.com/astral-sh/uv) is a fast, modern package and project manager written in Rust. It's a drop-in replacement for `pip`, `venv`, `pipenv` and friends, and it makes spinning up a new project painless.

### Starting a new project

```bash
uv init my-project    # scaffolds a new project (pyproject.toml, etc.)
cd my-project
uv add requests       # adds a dependency and updates the lockfile
uv run main.py        # runs inside the managed environment
```

`uv` handles the virtual environment for you - no need to manually create and activate a `venv` before installing things.

### Managing an existing project

```bash
uv venv               # create a virtual environment
uv sync               # install everything from the lockfile
uv add pytest --dev   # add a dev-only dependency
```

::: tip
`uv` is dramatically faster than `pip` and manages Python versions too (`uv python install 3.12`), so it can replace a whole stack of tools.
:::

### The old-school way

If you're not using `uv`, the built-in approach still works everywhere:

```bash
python -m venv .venv          # create a virtual environment
source .venv/bin/activate     # activate it (macOS/Linux)
pip install -r requirements.txt
```

## Tips & Tricks

- **Virtual environments always** - never install packages globally. Keeps projects isolated and reproducible.
- **`if __name__ == "__main__":`** - guards code that should only run when the file is executed directly, not when imported.
- **Use `pathlib` over `os.path`** - `Path("data") / "file.txt"` is cleaner and cross-platform.
- **Ternary expressions** - `x = "yes" if condition else "no"`.
- **Unpacking** - `a, b = b, a` swaps values; `first, *rest = [1, 2, 3]` grabs the head and tail.
- **Format with `ruff`** - a fast linter/formatter (also from Astral, the makers of `uv`) that replaces `black`, `flake8` and `isort`.
