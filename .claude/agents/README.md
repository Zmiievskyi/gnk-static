# MineGNK Agents

Custom agents for the MineGNK project.

## Available Agents

### Skills Guide

**File:** `skills-guide.md`

**Purpose:** Quick router to find the right skill for any task.

**When to use:**
- Unsure which skill applies
- Need workflow guidance (multiple skills)
- Want quick task recommendations

**How it works:**
1. Analyzes your request
2. Recommends 1-3 skills with slash commands
3. Provides 3 quick action steps
4. Lists files to edit

---

### Code Reviewer

**File:** `code-reviewer.md`

**Purpose:** Review code changes for quality, style compliance, and issues.

**When to use:**
- After writing or modifying code
- Before committing changes
- To audit existing code
- Pre-PR review

**How it works:**
1. Runs `git diff` to see changes
2. Reads modified files
3. Checks against project rules (`.claude/rules/`)
4. Reports issues by priority (Critical → Warning → Suggestion)

**Output format:**
```
## Code Review: [files]

### 🔴 Critical (must fix)
### 🟡 Warnings (should fix)
### 🟢 Suggestions (nice to have)
### ✅ Good Practices Found
### Summary
```

**Checks for:**
- CSS: Hardcoded colors, missing variables
- JS: Config patterns, IIFE modules, error handling
- HTML: Semantic elements, ARIA labels, accessibility
- General: Security issues, style compliance

## Agents vs Skills

| Agents | Skills |
|--------|--------|
| Interactive routers | Documentation/guides |
| Help you decide | Provide the details |
| Isolated context | Shared context |
| Explicitly invoked | Auto-invoked by context |

**Workflow:** Agent recommends → You invoke skill → Skill guides you

## Creating New Agents

Create a `.md` file with YAML frontmatter:

```markdown
---
name: agent-name
description: When to use this agent
tools: Read, Glob, Grep
model: haiku
---

# Agent Title

Instructions in markdown...
```

**Fields:**
- `name` - Identifier (lowercase, hyphens)
- `description` - When Claude should delegate here
- `tools` - Allowed tools (Read, Glob, Grep, Bash, etc.)
- `model` - `haiku` (fast), `sonnet` (balanced), `opus` (powerful)

## Related

- `.claude/skills/` - Skill documentation
- `.claude/rules/` - Code style guides
- `CLAUDE.md` - Project overview
