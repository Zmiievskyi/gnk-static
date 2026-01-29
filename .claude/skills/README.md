# MineGNK Skills

Skills for working with the MineGNK static website. Claude auto-invokes these based on context, or use slash commands directly.

## Available Skills

| Command | Name | Use For |
|---------|------|---------|
| `/gpu-config` | GPU Configuration | Update pricing, add GPU types, modify efficiency |
| `/design` | Design System | Brand colors, typography, styling patterns |
| `/add-section` | Section Builder | Create new page sections, layouts |
| `/api` | API Integration | Data fetching, polling, real-time updates |
| `/hubspot` | HubSpot Modal | Form integration, modal behavior |
| `/debug` | Troubleshooting | Diagnose bugs, fix common issues |
| `/test` | Testing | QA procedures, pre-deployment checks |
| `/deploy` | Deployment | Docker, static hosting, production setup |

## Auto-Invocation

Claude automatically loads relevant skills based on keywords:

- "update pricing" → `/gpu-config`
- "style component" → `/design`
- "add new section" → `/add-section`
- "API endpoint" → `/api`
- "HubSpot form" → `/hubspot`
- "bug", "error", "not working" → `/debug`
- "test", "QA", "check" → `/test`
- "deploy", "production" → `/deploy`

## Quick Workflows

**Update GPU price:**
```
/gpu-config → Update pricePerGpuHour in GPU_CONFIG
```

**Add new section:**
```
/add-section → Choose template → /design for styling
```

**Deploy to production:**
```
/test → Run checklist → /deploy → Docker commands
```

**Debug issue:**
```
/debug → Quick diagnostics → Check console/network
```

## File Structure

```
.claude/skills/
├── README.md               # This file
├── gpu-config-manager/     # /gpu-config
├── design-system/          # /design
├── section-builder/        # /add-section
├── api-integration/        # /api
├── hubspot-modal/          # /hubspot
├── troubleshooting/        # /debug
├── testing/                # /test
└── deployment/             # /deploy
```

## Related Files

- `CLAUDE.md` - Project overview
- `.claude/rules/` - CSS, HTML, JS style guides
