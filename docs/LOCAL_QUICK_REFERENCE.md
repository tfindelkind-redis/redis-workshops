# Quick Reference: Local Development

## One-Time Setup

```bash
./scripts/setup-local-mac.sh
```

## Daily Usage

```bash
# 1. Activate environment
source .activate-local

# 2. Start working
cd workshops/deploy-redis-for-developers-amr/module-08-implement-caching-lab
test-notebooks -d
```

## Common Commands

| Task | Command |
|------|---------|
| Activate environment | `source .activate-local` |
| Test notebooks | `test-notebooks` |
| Test with Docker | `test-notebooks -d` |
| Test module | `test-notebooks -m` |
| Test all | `test-notebooks -a` |
| Start Jupyter Lab | `jupyter lab` |
| Start Jupyter Notebook | `jupyter notebook` |
| Check Redis | `redis-cli ping` |
| Start Redis | `brew services start redis` |
| Stop Redis | `brew services stop redis` |

## Aliases

```bash
workshop-activate        # Activate environment
workshop-test            # Test current directory
workshop-test-module     # Test entire module
workshop-test-all        # Test all notebooks
workshop-jupyter         # Start Jupyter Lab
workshop-redis-start     # Start Redis
workshop-redis-stop      # Stop Redis
workshop-redis-status    # Check Redis status
```

## File Structure

```
redis-workshops/
├── .venv/              # Virtual environment (gitignored)
├── .activate-local     # Activation script (gitignored)
├── scripts/
│   ├── setup-local-mac.sh
│   └── test-notebooks
└── workshops/
```

## Troubleshooting

**Redis not running:**
```bash
brew services start redis
sleep 2
redis-cli ping
```

**Docker not running:**
- Start Docker Desktop app
- Wait for "Docker is running" status

**test-notebooks not found:**
```bash
source .activate-local
```

**Module import errors:**
```bash
source .activate-local
pip install -r tests/requirements.txt
```

## Clean Up

```bash
# Deactivate
deactivate

# Stop Redis
brew services stop redis

# Complete cleanup
rm -rf .venv .activate-local
```

## Getting Help

```bash
test-notebooks --help
jupyter --help
redis-cli --help
```

---

**📖 Full Documentation:** See `docs/LOCAL_DEVELOPMENT_MACOS.md`
