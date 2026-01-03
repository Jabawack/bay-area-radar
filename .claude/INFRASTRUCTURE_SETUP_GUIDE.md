# Claude Code Infrastructure Setup Guide

> **Stack-agnostic guide for setting up Claude Code infrastructure in any project.**
>
> Source Repository: https://github.com/diet103/claude-code-infrastructure-showcase

---

## Quick Start (5 minutes)

```bash
# Clone source repo to temp directory
git clone https://github.com/diet103/claude-code-infrastructure-showcase.git /tmp/claude-infra

# Copy entire .claude directory to your project
cp -r /tmp/claude-infra/.claude/* your-project/.claude/

# Clean up
rm -rf /tmp/claude-infra

# Install TypeScript runner for hooks (if using TS hooks)
npm install -D tsx
```

**Done!** The infrastructure is now installed. See [Customization](#customization-per-stack) for stack-specific adjustments.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [What You Get](#what-you-get)
- [Setup Methods](#setup-methods)
- [How Auto-Activation Works](#how-auto-activation-works)
- [Customization Per Stack](#customization-per-stack)
- [Verification Checklist](#verification-checklist)
- [Troubleshooting](#troubleshooting)
- [Lessons Learned](#lessons-learned)

---

## Architecture Overview

```
.claude/
├── settings.json              # Hook config + permissions
├── hooks/                     # Auto-activation system
│   ├── skill-activation-prompt.sh/ts   # UserPromptSubmit hook
│   └── post-tool-use-tracker.sh        # PostToolUse hook
├── agents/                    # 10 reusable agents
│   └── *.md
├── commands/                  # 3 slash commands
│   └── *.md
└── skills/
    ├── skill-rules.json       # Trigger patterns config
    ├── [infrastructure]/      # 5 reusable skills
    │   ├── SKILL.md
    │   └── resources/         # Progressive disclosure files
    └── [project-specific]/    # Add your own per-project
```

---

## What You Get

### Hooks (2)

| Hook | Event | Purpose |
|------|-------|---------|
| `skill-activation-prompt` | UserPromptSubmit | Suggests relevant skills based on user prompt |
| `post-tool-use-tracker` | PostToolUse | Tracks edited files, detects build commands |

### Agents (10)

| Agent | Purpose |
|-------|---------|
| `code-architecture-reviewer` | Review code for architectural consistency |
| `code-refactor-master` | Plan and execute refactoring |
| `documentation-architect` | Generate comprehensive docs |
| `frontend-error-fixer` | Debug frontend errors |
| `plan-reviewer` | Review development plans |
| `refactor-planner` | Create refactoring strategies |
| `web-research-specialist` | Research technical issues online |
| `auth-route-tester` | Test authenticated endpoints |
| `auth-route-debugger` | Debug auth issues |
| `auto-error-resolver` | Auto-fix TypeScript errors |

### Commands (3)

| Command | Purpose |
|---------|---------|
| `/dev-docs` | Create structured dev documentation |
| `/dev-docs-update` | Update docs before context reset |
| `/route-research-for-testing` | Research route patterns for testing |

### Infrastructure Skills (5)

| Skill | Purpose | Has resources/ |
|-------|---------|----------------|
| `skill-developer` | Meta-skill for creating/managing skills | Yes (6 files) |
| `frontend-dev-guidelines` | React/TypeScript/MUI patterns | Yes (10 files) |
| `backend-dev-guidelines` | Node.js/Express patterns | Yes |
| `route-tester` | Test authenticated API routes | No |
| `error-tracking` | Sentry integration patterns | No |

---

## Setup Methods

### Method 1: Clone (RECOMMENDED)

**Always use this method** - it preserves all subdirectories including `resources/`.

```bash
# Clone to temp
git clone https://github.com/diet103/claude-code-infrastructure-showcase.git /tmp/claude-infra

# Copy everything
cp -r /tmp/claude-infra/.claude/* your-project/.claude/

# Clean up
rm -rf /tmp/claude-infra
```

### Method 2: File-by-File Fetch (NOT RECOMMENDED)

Only use if you can't clone. **High risk of missing files.**

If you must use this method, follow this checklist:

```
For each skill:
- [ ] Fetch SKILL.md
- [ ] List resources/ directory contents via GitHub API
- [ ] Fetch EVERY file in resources/
- [ ] Verify no broken links in SKILL.md

After all fetches:
- [ ] Run verification script (see below)
- [ ] Check all grep results for "resources/" resolve to actual files
```

---

## How Auto-Activation Works

```
┌─────────────────┐
│   User Prompt   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  skill-activation-prompt hook   │
│  - Reads skill-rules.json       │
│  - Matches keywords/patterns    │
│  - Outputs skill suggestions    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Claude sees    │
│  suggestions    │
│  + user prompt  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Claude uses tools (Edit, etc)  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  post-tool-use-tracker hook     │
│  - Logs edited files            │
│  - Detects repo structure       │
│  - Caches build commands        │
└─────────────────────────────────┘
```

**Key insight**: Skills don't auto-activate on their own. The hooks + skill-rules.json combination enables intelligent suggestions.

---

## Customization Per Stack

### Step 1: Adapt Frontend Skill

Replace MUI v7 patterns if using a different UI library:

| MUI v7 (Default) | Tailwind | Chakra UI | Ant Design |
|------------------|----------|-----------|------------|
| `@mui/material` | Tailwind classes | `@chakra-ui/react` | `antd` |
| `sx` prop | `className` | `sx` or style props | `style` prop |
| `Grid size={{}}` | Flex/Grid CSS | `SimpleGrid` | `Row`/`Col` |
| `ThemeProvider` | `tailwind.config.js` | `ChakraProvider` | `ConfigProvider` |

### Step 2: Adapt Backend Skill

Replace Node.js patterns if using a different backend:

| Node.js (Default) | Python | Go | Rust |
|-------------------|--------|-----|------|
| Express routes | FastAPI/Flask | Gin/Echo | Actix/Axum |
| Controllers | Views/Routers | Handlers | Handlers |
| `npm`/`pnpm` | `pip`/`poetry` | `go mod` | `cargo` |
| Prisma | SQLAlchemy/Django ORM | GORM | Diesel |

### Step 3: Update skill-rules.json File Patterns

```json
// Node.js/TypeScript (default)
"pathPatterns": ["src/**/*.ts", "src/**/*.tsx"]

// Python
"pathPatterns": ["**/*.py", "!**/__pycache__/**"]

// Go
"pathPatterns": ["**/*.go", "!vendor/**"]

// Rust
"pathPatterns": ["src/**/*.rs"]

// Java
"pathPatterns": ["src/**/*.java"]
```

### Step 4: Add Project-Specific Skills

Create new skills for your domain:

```
.claude/skills/
├── [infrastructure skills]     # Keep these
├── my-project-patterns/        # Add your own
│   ├── SKILL.md
│   └── resources/
└── skill-rules.json            # Add triggers for new skills
```

---

## Verification Checklist

### Post-Setup Verification Script

Run this after setup to catch missing files:

```bash
#!/bin/bash
echo "=== Claude Code Infrastructure Verification ==="

# Check for broken resource references
echo -e "\n1. Checking for broken resource links..."
MISSING=0
for skill in .claude/skills/*/; do
  if [ -f "$skill/SKILL.md" ]; then
    grep -o 'resources/[^)]*\.md' "$skill/SKILL.md" 2>/dev/null | while read ref; do
      if [ ! -f "$skill/$ref" ]; then
        echo "   MISSING: $skill$ref"
        MISSING=$((MISSING + 1))
      fi
    done
  fi
done
[ $MISSING -eq 0 ] && echo "   All resource links valid!"

# Count verification
echo -e "\n2. Component counts:"
echo "   Hooks:    $(ls .claude/hooks/*.sh .claude/hooks/*.ts 2>/dev/null | wc -l | tr -d ' ')"
echo "   Agents:   $(ls .claude/agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
echo "   Commands: $(ls .claude/commands/*.md 2>/dev/null | wc -l | tr -d ' ')"
echo "   Skills:   $(ls -d .claude/skills/*/ 2>/dev/null | wc -l | tr -d ' ')"
echo "   Resources: $(find .claude/skills/*/resources -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"

# Expected counts
echo -e "\n3. Expected counts:"
echo "   Hooks:    2-3"
echo "   Agents:   10"
echo "   Commands: 3"
echo "   Skills:   5+ (infrastructure) + project-specific"
echo "   Resources: 20+"

# Settings check
echo -e "\n4. Settings validation:"
if [ -f ".claude/settings.json" ]; then
  if grep -q "UserPromptSubmit" .claude/settings.json; then
    echo "   UserPromptSubmit hook: configured"
  else
    echo "   UserPromptSubmit hook: MISSING"
  fi
  if grep -q "PostToolUse" .claude/settings.json; then
    echo "   PostToolUse hook: configured"
  else
    echo "   PostToolUse hook: MISSING"
  fi
else
  echo "   settings.json: NOT FOUND"
fi

echo -e "\n=== Verification Complete ==="
```

### Manual Verification

- [ ] `settings.json` has UserPromptSubmit and PostToolUse hooks configured
- [ ] All 10 agents present in `.claude/agents/`
- [ ] All 3 commands present in `.claude/commands/`
- [ ] All 5 infrastructure skills have SKILL.md
- [ ] Skills with resources/ have all referenced files
- [ ] `skill-rules.json` is valid JSON (`jq . .claude/skills/skill-rules.json`)
- [ ] Hooks are executable (`chmod +x .claude/hooks/*.sh`)

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Skills not suggesting | Hook not configured | Check `settings.json` has UserPromptSubmit |
| Hook not running | Not executable | `chmod +x .claude/hooks/*.sh` |
| TypeScript hook fails | tsx not installed | `npm install -D tsx` |
| Wrong skill suggested | Pattern too broad | Refine keywords/patterns in skill-rules.json |
| Broken resource links | Incomplete setup | Re-clone and copy (don't fetch file-by-file) |
| JSON parse error | Invalid skill-rules.json | Validate with `jq . skill-rules.json` |

---

## Lessons Learned

### Issue: Missing resources/ Subdirectories

**What happened**: File-by-file fetch missed entire `resources/` directories, leaving SKILL.md files with broken references.

**Root causes**:
1. WebFetch cannot recursively fetch directories
2. No verification step after setup
3. Easy to forget subdirectories exist

**Prevention**:
1. **Always clone** - don't fetch file-by-file
2. **Run verification script** - catches broken links
3. **Check expected counts** - validates completeness

**Takeaway**: Progressive disclosure (SKILL.md → resources/) requires preserving complete directory structure. Cloning guarantees this.

---

## Quick Reference

### settings.json Template

```json
{
  "permissions": {
    "allow": ["Edit:*", "Write:*", "MultiEdit:*", "Bash:*", "Read:*"]
  },
  "hooks": {
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "command",
        "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/skill-activation-prompt.sh"
      }]
    }],
    "PostToolUse": [{
      "hooks": [{
        "type": "command",
        "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/post-tool-use-tracker.sh"
      }]
    }]
  }
}
```

### Skill Structure Template

```
.claude/skills/my-skill/
├── SKILL.md           # Main content (under 500 lines)
└── resources/         # Detailed guides (progressive disclosure)
    ├── guide-1.md
    └── guide-2.md
```

### SKILL.md Frontmatter Template

```markdown
---
name: my-skill-name
description: Brief description with trigger keywords. Mention topics, file types, use cases.
---

# My Skill Name

## Purpose
What this skill helps with

## When to Use
Specific scenarios

## Quick Reference
Condensed info (keep SKILL.md under 500 lines)

## Detailed Guides
- [Guide 1](resources/guide-1.md)
- [Guide 2](resources/guide-2.md)
```

---

**Version**: 1.1
**Last Updated**: 2026-01-02
**Maintainer**: Update this guide when patterns change
