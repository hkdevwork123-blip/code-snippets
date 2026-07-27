---
outline: deep
---

# Shell

Shell scripting is a powerful tool for interacting with and automating tasks in Unix-like operating systems such as Linux and macOS. It encompasses a wide range of capabilities, including:

- File System Navigation: Efficiently move through directories, list contents, and manage files.

- Text Processing: Manipulate and analyze text files using commands like grep, sed, and awk.

- System Administration: Automate routine tasks, manage processes, and monitor system resources.

- Bash Scripting: Create complex scripts to automate workflows and build custom tools.

## The Basics

**Z Shell (/bin/zsh)**: Historically it was named after Yale’s “z” (it came after “y” in some early shell family names), but practically it just means “Z Shell,” a feature‑rich shell that’s more interactive‑friendly than bash by default.

**Bash (/bin/bash)** Bourne Again SHell—a successor to the original Bourne shell (sh)

Zsh has nicer interactive defaults (better completion, history behaviour, spelling fixes), so it feels better out of the box. Bash can be configured to do similar things, but you usually have to set it up manually.

You can run either of the below to see which shel you are using

```bash
echo $SHELL
echo $0
```

## The Code Snippets

Get the history of a specific command previously run

```bash
history | grep vite
```

Search for a specific folder

```bash
find . -type d -name "*DP-545*"
```

Try and find specific folders. The -maxdepth flag limits how deep find goes, and -type d restricts results to
directories. -name "_htmx_" does a wildcard match on folder names.

```bash
  # Find all directories with "htmx" in the name (up to 4 levels deep)
  find /Users/hectorkurtyanek -maxdepth 4 -type d -name "*htmx*"

  # Broader search up to 5 levels deep
  find /Users/hectorkurtyanek -maxdepth 5 -type d -name "*htmx*"
```

Create a base64 encoded basic auth token

```bash
echo -n "username:password" | base64
```
