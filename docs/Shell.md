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

### Finding Files

Find files by name (case-insensitive) anywhere under the current directory

```bash
find . -type f -iname "*.log"
```

Find files larger than 100MB

```bash
find . -type f -size +100M
```

Find files modified in the last 24 hours

```bash
find . -type f -mtime -1
```

Search inside files for a string and list the matching filenames

```bash
# ripgrep is fast and respects .gitignore
rg -l "TODO" .

# grep fallback
grep -rl "TODO" .
```

### Killing Processes

Find the process listening on a given port

```bash
lsof -i :3000
```

Kill whatever is holding a port (macOS / Linux)

```bash
kill -9 $(lsof -ti :3000)
```

Find a process by name and kill it

```bash
pgrep -fl node        # list matching processes with their command line
pkill -f "vite"       # kill every process whose command line matches "vite"
```

Gracefully terminate, then force-kill if it survives

```bash
kill 12345            # SIGTERM (graceful)
kill -9 12345         # SIGKILL (force)
```

### Network Checks

List listening TCP ports. On Linux, `netstat -tulpn` also shows the owning process. macOS `netstat` has no `-p` flag, so it can only list the ports, not which process holds them - use `lsof` when you need the process too.

```bash
# Linux: ports + owning process
netstat -tulpn

# macOS: ports only (no process)
netstat -an | grep LISTEN

# macOS: ports + owning process
lsof -nP -iTCP -sTCP:LISTEN
```

Check whether a specific port is open on a remote host. `-z` is zero-I/O (just probe, send nothing), `-v` is verbose. A `succeeded` line means the remote host is accepting TCP connections on that port (here, its HTTPS server is up)

```bash
nc -vz example.com 443
# Connection to example.com port 443 [tcp/https] succeeded!
```

Show active connections and listening sockets. `ss` (from Linux's `iproute2`) is the modern replacement for `netstat`, but it is **Linux-only** and is not available on macOS.

```bash
# Linux
ss -tulpn

# macOS: use lsof (shows the owning process, like ss does)
lsof -nP -iTCP -sTCP:LISTEN
```

Quick DNS lookup and reachability check

```bash
dig +short example.com
ping -c 4 example.com
```

### Base64 Encoding

Encode a password or API key (the -n avoids adding a trailing newline)

```bash
echo -n "s3cr3t-api-key" | base64
```

Decode a base64 string back to plain text

```bash
echo "czNjcjN0LWFwaS1rZXk=" | base64 --decode
```

Encode the contents of a file (e.g. a cert or key) to base64

```bash
base64 -i ./api-key.txt
```
