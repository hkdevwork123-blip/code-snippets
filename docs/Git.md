# Git

Git is a distributed version control system that helps track changes in source code during software development. It allows multiple developers to work together on projects efficiently.

## Basic Concepts

### Repository (Repo)

- A container for your project that contains all files and version history
- Can be local (on your computer) or remote (like on GitHub)

### Commit

- A snapshot of your changes at a specific point in time
- Each commit has a unique identifier (hash)
- Includes a message describing what changed

#### Semantic Commits

| Type     | Use for                                             |
| -------- | --------------------------------------------------- |
| feat     | New feature or notable new capability               |
| fix      | Bug fix                                             |
| docs     | Documentation (README, comments, etc.)              |
| style    | Formatting, whitespace, no logic change             |
| refactor | Code change that doesn’t add a feature or fix a bug |
| test     | Adding or updating tests                            |
| chore    | Build, tooling, deps, config, small repo upkeep     |

### Branch

- A separate line of development
- `main` (or `master`) is typically the default branch
- Allows working on features without affecting the main codebase

## SSH

SSH – Secure Shell / Secure Socket Shell is a network protocol that gives users a secure way to access a computer over an unsecure network. It appeared in the mid 90s as a sort of replacement / way of connecting to a remote machine over the internet.

SSH is commonly implemented using the client server model. One computer is called the SSH client and another computer acts as the SSH server.

SSH can then be set up using a pair of keys. A public key that is stored on the SSH server and a private key that is locally stored on the SSH client. The SSH client which is usually your computer, will make contact with the SSH server and provides the ID of the key pair it wants to use to prove its identity.

The SSH server then creates a “challenge” which is encrypted by the public key and sent back to the client. You as the client then take the “challenge” decrypt it with your private key and send the original “challenge” back to the SSH server. Once the negotiation is complete the connection is established.

### GitHub SSH Setup

- [GitHub Docs](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/about-ssh)

With SSH keys, you can connect to GitHub without supplying your username and personal access token at each visit.

1. To find out if you’ve already got an SSH key set up on your computer you can run the following command

```bash
ls -al ~/.ssh
```

This will list the files in your .ssh directory if they exist. You can check to see if you already have a public key by seeing if any of the below filenames are present

o id_rsa.pub
o id_ecdsa.pub
o id_ed25519.pub

Your private key will simply omit the extension .pub – so will look like the below
o Id_rsa

#### Ed25519 Vs RSA

RSA (that's the part you see here `Id_rsa`) and Ed25519 are two different cryptographic methods (key algorithms) used to securely generate and protect SSH key pairs so your connections can be authenticated and encrypted safely. We use Ed25519 for new SSH keys because it provides strong modern security with smaller keys, better performance, and simpler, safer defaults than RSA, which makes it the recommended option.

- [References](https://www.brandonchecketts.com/archives/its-2023-you-should-be-using-an-ed25519-ssh-key-and-other-current-best-practices)

2. Generate a new SSH key for personal GitHub

```bash
ssh-keygen -t ed25519 -C "your-personal-email@example.com" -f ~/.ssh/id_ed25519_github_personal
```

When prompted for a passphrase, you can:

- Press Enter for no passphrase (more convenient, less secure), or
- Enter a passphrase and let macOS remember it.

3. Add the key to the SSH agent (macOS + keychain)

```bash
eval "$(ssh-agent -s)"

ssh-add --apple-use-keychain ~/.ssh/id_ed25519_github_personal
# (If --apple-use-keychain errors, just use ssh-add ~/.ssh/id_ed25519_github_personal)
```

4. Add the public key to GitHub

- Copy the public key: `pbcopy < ~/.ssh/id_ed25519_github_personal.pub`
- Go to [Settings](https://github.com/settings/keys) `New SSH Key` and add the key

5. Configure `~/.ssh/config` for GitHub personal

- Open config: `code ~/.ssh/config`
- Add a **host alias** like the below. The alias name (`github-personal`) is what you use in remote URLs to opt into the personal key — it does not have to match the real hostname.

```bash
# Personal GitHub account (opt-in alias)
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github_personal
  IdentitiesOnly yes
```

How this works: when you run `ssh git@github-personal`, SSH matches the `Host github-personal` block, connects to the real `HostName` (`github.com`), and uses the key named in `IdentityFile`. `IdentitiesOnly yes` makes SSH offer **only** that key rather than trying every key in your agent.

If instead you used `Host github.com`, you'd be forcing **all** github.com traffic onto that key. Using a distinct alias keeps the default github.com behaviour untouched and lets you switch to the personal key only when you want to.

> **Note:** comments in `~/.ssh/config` start with `#`. Add notes to remind yourself how to switch keys later — e.g. duplicate the block as `Host github-work` pointing at your work key (`~/.ssh/id_ed25519`).

6. Test the SSH connection

```bash
ssh -T git@github-personal
```

You’ll see this message the first time you connect to a new host because SSH doesn’t yet trust its identity; just type yes to store the host’s key in known_hosts so future connections can verify you’re talking to the same server

```bash
The authenticity of host 'github.com (20.26.156.215)' can't be established.
ED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'github.com' (ED25519) to the list of known hosts.
Hi your-username! You've successfully authenticated, but GitHub does not provide shell access.
```

The `Hi your-username!` greeting confirms the key authenticated. (The command then exits with a non-zero code — that's normal, GitHub never grants shell access.)

7. Update an existing repo’s remote URL to use SSH
   If you already cloned using HTTPS or `git@github.com:...`, update the remote to use the alias:

```bash
cd /path/to/your/repo

git remote set-url origin git@github-personal:your-username/your-repo.git
```

Check:

```bash
git remote -v
```

You should see:

```bash
origin git@github-personal:your-username/your-repo.git (fetch)
origin git@github-personal:your-username/your-repo.git (push)
```

### Switching an Existing Repo to a Different Account

Say you cloned a repo under an old/wrong GitHub account and want to move it to your personal one (e.g. from `HK273/next-template` to `hkdevwork123-blip/next-template`). Two things usually need changing: the **remote URL** (which account/key it pushes to) and the **local git identity** (who authors commits).

1. Check the current state:

```bash
cd /path/to/your/repo
git remote -v          # see where origin points
git config user.email  # see who commits are authored as
```

2. Point the remote at the new repo, using your personal SSH alias so it uses the right key:

```bash
git remote set-url origin git@github-personal:hkdevwork123-blip/next-template.git
```

3. Set the local identity so future commits are authored by the right account (project-level, so it doesn't affect your global/work default):

```bash
git config user.name "Your Name"
git config user.email "your-personal-email@example.com"
```

4. Verify the remote authenticates and is reachable (read-only, changes nothing):

```bash
git ls-remote origin
```

- No error → auth works. Empty output means the remote repo exists but has no commits yet (you haven't pushed).
- A permission error means the key/alias isn't matching — recheck `~/.ssh/config`.

5. Push your branch to populate the new repo and set up tracking:

```bash
git push -u origin main
```

```bash
# Expected:
#  * [new branch]      main -> main
# branch 'main' set up to track 'origin/main'.
```

> **Note:** this only changes where _this_ clone pushes. The old repo under the previous account is untouched — archive or delete it on GitHub separately if you no longer need it.

## Essential Commands

### Setup and Configuration

```bash
# Show current config
git config --list --show-origin

# Add / Update config
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

For any work repos, set the config at the project level

```bash
cd /path/to/work/repo
git config user.name "Hector Kurtyanek"
git config user.email "hkurtyanek@adaptavist.com"
```

#### Global vs Local Identity (common gotcha)

`git config user.email` reads the config of **whatever directory you're currently in**. There are two levels and the more specific one wins:

- **Global** (`~/.gitconfig`) — your default, used everywhere unless overridden. Set with `git config --global ...`.
- **Local** (`<repo>/.git/config`) — per-repo override. Set with `git config ...` (no `--global`) **from inside the repo**.

So if you set a personal email locally in one repo but then run `git config user.email` from your home directory (or any other repo), you'll see the **global** value instead — and think it didn't work. It did; you're just standing in the wrong place.

To see exactly which value applies and where it comes from:

```bash
git config --show-origin --get-all user.email
# file:/Users/you/.gitconfig        hkurtyanek@adaptavist.com   <- global default
# file:.git/config                  hkdevwork123@gmail.com      <- local override (wins)
```

To check a specific repo's identity without `cd`-ing into it, use `-C <path>`:

```bash
git -C /path/to/your/repo config user.email
# -> hkdevwork123@gmail.com
```

> **Remember:** the local override is the one baked into new commits, but only while you commit from inside that repo. Identity is frozen into each commit at creation — changing config later does not rewrite existing commits.

### Starting a Project

```bash
git init                    # Initialize a new Git repository
git clone <repo-url>        # Clone an existing repository
```

### Basic Workflow

```bash
git status                  # Check status of working directory
git add <file>             # Stage changes for commit
git add .                  # Stage all changes
git commit -m "message"     # Commit staged changes
git push                   # Push commits to remote repository
git pull                   # Fetch and merge changes from remote
git branch -m old-name new-name # Rename a branch
```

### Understanding git pull vs git merge

`git pull origin main` vs `git merge main`:

- `git pull origin main`: This command does two things:

  1. Fetches the latest changes from the remote repository's main branch
  2. Automatically merges these changes into your current branch
     It's essentially a combination of `git fetch` + `git merge`

- `git merge main`: This command only merges the local main branch into your current branch
  - It doesn't fetch any new changes from remote
  - Only works with the commits already present in your local repository

When to use which:

- Use `git pull origin main` when you want to get and merge the latest changes from the remote repository
- Use `git merge main` when you want to merge changes that are already in your local main branch

### Branching

```bash
git branch                 # List branches
git branch <name>          # Create new branch
git checkout <branch>      # Switch to branch
git checkout -b <name>     # Create and switch to new branch
git merge <branch>         # Merge branch into current branch
git branch -m new-branch-name # Change branch name (will also need to git push origin new-branch-name if already pushed upstream)
git branch -r # Check remote branches, see if your branch exists there too
git fetch --all # Fetch latest remote changes
git push -u origin feat/ORB-338-xero-client # Push branch / use if you need to check branch has been pushed
git remote -v # Check remote repo config
git log --oneline origin/main..HEAD # Check if any merge request open for current branch
git branch --show-current # Show the current branch
git push -f origin feat/ORB-338-xero-client # Force push the branch
```

### Git Worktrees

`git worktree` lets you use multiple branches from the same repo in separate folders. It's useful for parallel feature work, separate IDE windows, or keeping an agent running on one branch while you work on another.

#### Create a worktree

From inside your repo:

```bash
git fetch origin
git worktree add ../orbit-web-service-feature-b -b feature-b origin/main
```

This:

- creates a new folder next to your repo
- creates a new branch
- checks it out in that folder

#### Use it

Move into the new worktree:

```bash
cd ../orbit-web-service-feature-b
git branch --show-current
```

#### Switch worktrees

A worktree is just another folder:

```bash
cd /Users/hectorkurtyanek/Desktop/repos/orbit-web-service
cd /Users/hectorkurtyanek/Desktop/repos/orbit-web-service-feature-b
```

List all worktrees:

```bash
git worktree list
```

#### Switch or create branches in a worktree

```bash
git switch branch-name
git switch -c new-branch-name
```

A branch can only be checked out in one worktree at a time.

#### Rename the current branch

```bash
git branch -m better-branch-name
```

#### Push your branch

```bash
git add .
git commit -m "Add feature"
git push -u origin better-branch-name
```

Then open your MR/PR as normal.

#### After merge

**Remove the worktree** - best if it was just for one feature:

```bash
git worktree remove ../orbit-web-service-feature-b
git branch -d better-branch-name
```

**Reuse the worktree** - update it and start another branch:

```bash
cd ../orbit-web-service-feature-b
git fetch origin
git switch main
git pull
git switch -c next-feature
```

#### Useful commands

```bash
git worktree list
git branch --show-current
git status
pwd
```

> **Tip:** before committing or pushing, check where you are - this avoids making changes in the wrong worktree or branch:
>
> ```bash
> pwd
> git branch --show-current
> ```

### Viewing History

```bash
git log                    # View commit history
git log --oneline         # Compact view of history
git diff                  # Show unstaged changes
git diff --staged         # Show staged changes
```

## Best Practices

1. **Commit Messages**

   - Write clear, descriptive commit messages
   - Use present tense ("Add feature" not "Added feature")
   - Keep first line under 50 characters

2. **Branching Strategy**

   - Create feature branches for new work
   - Keep `main` branch stable
   - Delete merged branches

3. **Regular Updates**
   - Pull changes frequently
   - Push your changes regularly
   - Keep local repo in sync with remote

## Common Workflows

### Feature Development

1. Create feature branch
2. Make changes and commit
3. Push branch to remote
4. Create pull request
5. Review and merge

### Fixing Mistakes

```bash
git checkout -- <file>     # Discard changes in working directory
git reset HEAD <file>      # Unstage changes
git revert <commit>        # Create new commit that undoes changes

# Revert an entire branch that has been committed to main
# In gitlab you can get the merge commit from the MR
git checkout main
git pull
git checkout -b revert-remove-invoice-url
git revert -m 1 00baef22
```

![design](/images/merge-commit.png)

Running the above you'll then get something like the below in your terminal telling you what you are about to revert...

![design](/images/revert-commit.png)

### Keeping Branches Updated with Main

1. **Update Local Main**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Switch to Feature Branch**

   ```bash
   git checkout feature-branch
   ```

3. **Pull Latest Main into Feature Branch**

   ```bash
   git pull origin main
   ```

4. **Merge Main into Feature Branch**

   ```bash
   git merge main
   ```

5. **Resolving Merge Conflicts**

   ```bash
   # When conflicts occur:
   git status              # See which files have conflicts

   # Open conflicted files and look for:
   # <<<<<<< HEAD
   # Your changes
   # =======
   # Changes from main
   # >>>>>>> main

   # After resolving conflicts:
   git add <resolved-files>
   git commit -m "Merge main into feature-branch"
   ```

   Tips for Resolving Conflicts:

   - Keep changes from both branches if appropriate
   - Discuss with team members if unsure
   - Test thoroughly after resolving conflicts

   Using VS Code's Merge Conflict Resolver:

   - **Accept Current Change**: Keep the changes from your feature branch
   - **Accept Incoming Change**: Take the changes from main branch
   - **Accept Both Changes**: Keep both sets of changes, one after the other
   - **Compare Changes**: View a side-by-side comparison of both versions

   The resolver makes it easy to:

   - See both versions side by side
   - Choose which changes to keep with a single click
   - Combine changes when both versions have valid updates
   - Navigate between multiple conflicts in the same file

6. **Verify the Merge**
   ```bash
   git status              # Ensure everything is clean
   git log --graph --oneline  # View merge history
   ```

## Advanced Topics

### Stashing

Takes your current changes off the working tree (branch looks clean), stores them on the stash stack, and leaves your branch in a state where you can switch branches or pull without conflicts.

```bash
# Save changes (tracked files only)
git stash
# Stash with a message
git stash push -m "WIP: short description of what you were doing"

# Switch branch
git checkout other-branch

# List stashes
git stash list
# stash@{0}: On feature-x: WIP: latest stuff
# stash@{1}: On main: WIP: billing schedule

# Later: bring changes back
git stash apply    # apply but keep stash for reuse
git stash pop      # apply and remove from stack, clean stash
git stash apply stash@{1} # apply specific stash, if you have multiple

```

```bash
# You can then use restore to go back to the original "clean" branch
# a git stash apply can then take you back to the stash
git restore .
```

### Removing Untracked Files

This can be really usefuel if for example someone messes up the `.gitignore` - so we had a situation where someone put this in the `.gitignore`

```bash
./assistant-jira-9/assistant/target
```

./ doesn't work with `.gitignore` and what this ended up doing was that when I built the app all of the Java target files start getting tracked by git, which we don't want. You can use the below to prevent tracking all target files.

```bash
**/target/
```

But we then need a clean way to remove all of these tracked files we don't want tracked!

**To remove all untracked files:**

```bash
git clean -fd
```

- `-f`: force (required, git won't do it otherwise)
- `-d`: also remove untracked directories

To

**To unstage everything (remove from staging area but keep the files):**

```bash
git reset HEAD
```

**If you want to unstage and discard the changes entirely (revert files back to their last committed state):**

```bash
git checkout -- .
```

**Or if you want to do both — unstage, discard modifications, and remove untracked files — in one go:**

```bash
git reset HEAD && git checkout -- . && git clean -fd
```

### Rebasing

[Git Pull Rebase vs Git Pull](https://medium.com/@DGabeau/git-pull-rebase-vs-git-pull-c2b352fe53aa)

So had quite a bit of fun with this when we had a few stacked MR's

#### Stacked / Chained MRs Guide

**1. Stacked / Chained MRs (Part 1, Part 2, 2.1, 3)**

Branches were created on top of each other:

- **Part 1:** `feat/ORB-878-customer-payment-term` → `main`
- **Part 2:** `feat/ORB-878-due-date-edit-invoice` → Part 1
- **Part 2.1:** `feat/ORB-878-test-due-date-invoice-upd` → Part 2
- **Part 3:** `feat/ORB-878-due-date-calculation` → Part 2

This is a **stacked MRs pattern** — each MR is small and targets the previous feature branch. Eventually everything needs to land in `main`.

#### Merge Order

1. Merge Part 1 → `main`
2. Rebase Part 2 onto `main`, retarget MR → `main`, merge
3. Repeat for Part 2.1 and Part 3

---

**2. Updating `main` vs Updating a Feature Branch**

#### Update `main` from remote

```bash
git checkout main
git pull origin main
```

`git pull` = `git fetch` + `git merge origin/main` into `main`.

#### Update a feature branch with latest `main`

**A. Merge `main` into the feature branch** (no history rewrite):

```bash
git checkout my-feature
git pull origin main   # merges origin/main into my-feature
```

- ✅ No force-push required, safer for shared branches
- ❌ Creates merge commits like `"Merge branch 'main' into my-feature"`

**B. Rebase feature branch onto `main`** (clean, linear history):

```bash
git checkout my-feature
git fetch origin
git rebase origin/main
```

Or shorter:

```bash
git checkout my-feature
git pull --rebase origin main
```

- ✅ No merge commits, linear history (preferred for clean MRs)
- ❌ Rewrites branch history → requires force-push

---

**3. Why `git push --force-with-lease` After Rebase**

Rebase rewrites the local branch history, so the remote branch no longer matches.

```bash
git push --force-with-lease
```

- Force-updates the remote branch to match your local rebased branch
- `--force-with-lease` is **safer than `--force`** — it refuses to overwrite remote changes if someone else pushed after your last fetch/pull
- Use this **only on feature branches**, never on shared `main`

---

**4. Retargeting the MR After Rebase**

Once Part 1 is merged into `main` and Part 2 is rebased onto `origin/main`:

1. Push Part 2:
   ```bash
   git push --force-with-lease
   ```
2. In the UI:
   - Open the MR for Part 2
   - Ensure target is `main` (GitLab/GitHub may auto-switch if the old target is merged)
   - Check the diff shows **only Part 2 changes**
   - Merge when ready

Repeat the same pattern for later parts.

---

**5. Understanding Conflict Resolution: Current vs Incoming vs Both**

During a rebase, when you hit conflicts, Git shows both versions of the code:

The below actually shows what happens when you click one of...

- **Accept Current** → keep mine, drop theirs.
- **Accept Incoming** → keep theirs, drop mine.
- **Accept Combination (Current First)** → keep both: mine then theirs.
- **Accept Combination (Incoming First)** → keep both: theirs then mine.

```bash
<<<<<<< HEAD          # "Incoming" for rebase — code from origin/main
...code from origin/main...
=======
...code from your feature commit...
>>>>>>> <commit-sha>  # "Current" feature commit
```

Editors usually label them:

| Label                    | Meaning                                                   |
| ------------------------ | --------------------------------------------------------- |
| **Current** (or LOCAL)   | Code from your feature branch commit                      |
| **Incoming** (or REMOTE) | Code from `origin/main` (the branch you're rebasing onto) |
| **Both / Combination**   | Keep both hunks                                           |

#### What the Buttons Actually Do

- **Accept Current** — Keep only your feature branch version; drop `main`'s version
- **Accept Incoming** — Keep only `origin/main`'s version; drop your feature's version
- **Accept Both / Combination** — Keep both blocks back-to-back (may need manual cleanup)

#### How to Decide

**If Current is a strict superset of Incoming:**

For example, Incoming (`main`) has:

```ts
Transaction.custbody_adap_usd_conversion,
Term.name AS customerPaymentTerms
```

And Current (feature) has:

```ts
Transaction.custbody_adap_usd_conversion,
tc.tax_rate AS taxRate,
Transaction.custbody_avst_atl_quote_url1,
Transaction.custbody_avst_atl_inv_url1,
Term.name AS customerPaymentTerms
```

Current already includes everything Incoming has plus more → **Accept Current**

**If Incoming already contains the logic you need** → Accept Incoming

**If both sides add different, necessary pieces** → Accept Both, then manually remove duplicates, adjust ordering/syntax, and verify the final code compiles correctly

**If both sides look identical** → Any choice is fine

### Workflow for Conflicts

For each conflicted file:

1. Open the file and inspect each conflict block
2. Choose **Current**, **Incoming**, or **Both** using the logic above
3. Clean up any duplicates or syntax issues
4. Stage the file:
   ```bash
   git add <file>
   ```
5. When all conflicts are resolved and staged:
   ```bash
   git rebase --continue
   ```
6. Repeat until the rebase completes, then:
   ```bash
   git push --force-with-lease
   ```

---

**6. Summary: The Happy Path**

For **Part 2** (`feat/ORB-878-due-date-edit-invoice`):

1. Part 1 MR merged into `main` via UI
2. Locally:
   ```bash
   git checkout main
   git pull origin main
   git checkout feat/ORB-878-due-date-edit-invoice
   git fetch origin
   git rebase origin/main
   # resolve conflicts, git add ..., git rebase --continue (repeat as needed)
   git push --force-with-lease
   ```
3. In the UI:
   - MR now targets `main` (auto or manual)
   - Diff shows only Part 2's changes
   - Merge MR into `main`

Repeat the same pattern for all subsequent stacked branches.

```bash
git rebase <branch>        # Reapply commits on top of another branch
git rebase -i HEAD~3      # Interactive rebase for last 3 commits
```

### Squashed Commits

**Squashing:** Taking multiple commits and combining them into fewer commits (often just one).

More concretely:

Suppose your feature branch has these commits:

- A: `feat: add due date field`
- B: `fix: correct due date calculation`
- C: `refactor: clean up due date logic`
  If you squash them, you might end up with a single commit:
- S: `feat: add due date field (with fixes and cleanup)`

All the code changes from A, B, and C are still there, but they now live in one commit instead of three.

With “Squash and merge” as default:

- Commits that originated in Part 1, for example, become a new squashed commit on main.
- Part 2, which still has the original Part 1 commits, now diverges:
- main has a squashed version of Part 1
- Part 2 has the original Part 1 commits
- When you rebase/merge main into Part 2, Git can’t match them by SHA → more chances for conflicts.

Given we are squash‑merging into main by default, pulling main into the feature branch (merge) is probably the simpler / less painful option right now, even though rebase gives a cleaner history!

### Tags

```bash
git tag <name>            # Create lightweight tag
git tag -a v1.0 -m "message"  # Create annotated tag
```

## Troubleshooting

### Common Issues

1. Merge conflicts

   - Occur when same lines changed in different branches
   - Resolve manually in affected files
   - Use `git status` to find conflicted files

2. Detached HEAD
   - Happens when checking out specific commit
   - Create branch to save changes
   - Or return to branch with `git checkout <branch>`

### Useful Commands for Problems / Other Random Stuff!

**GitLab pipeline not triggering, just use an empty commit**

```bash
git commit --allow-empty -m "Empty commit to trigger CI/CD pipeline"
```

```bash
git diff --name-only main...HEAD # See all diffs from main on current branch
git reflog                 # View history of HEAD changes
git fsck                   # Check repository integrity
git clean -n              # Show what would be deleted
git clean -f              # Remove untracked files
git remote set-url origin git@bitbucket.org:adaptavistlabs/adaptagram.git # switch the remote tracking, e.g. if repo moved
```

### Git: cannot lock ref … origin/test exists; cannot create … origin/test/…

- What: Fetch/pull fails when Git can’t create refs/remotes/origin/test/something because refs/remotes/origin/test already exists (same path can’t be both a ref “file” and a directory).

- Why: Branch test and branch test/… clash for local remote-tracking refs. Often test is gone on the server but origin/test is still in your clone.

Look up

```bash
# Branches under test/ on remote
git ls-remote origin 'refs/heads/test/\*'

# Exact branch named test on remote (not shown by test/\*)

git ls-remote origin refs/heads/test

# What your clone thinks exists

git branch -r | grep origin/test
Resolve
If refs/heads/test is empty (no test on remote) → stale origin/test:

git branch -r -d origin/test

# if needed:

git update-ref -d refs/remotes/origin/test
git fetch origin

# or: git pull

Optional cleanup:

git fetch --prune origin
```

If both test and test/… still exist on remote → rename or delete one branch on the host; local deletes alone aren’t a full fix if you need both names.
