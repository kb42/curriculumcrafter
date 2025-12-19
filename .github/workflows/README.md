# GitHub Actions Workflows

This directory contains CI/CD workflows for CurriculumCrafter.

## Active Workflows

### 1. keep-alive.yml

**Purpose:** Prevents free tier services from shutting down due to inactivity

**Trigger:** Scheduled (cron) + Manual
- Runs twice daily at 00:00 and 12:00 UTC
- Can be manually triggered from Actions tab

**What it does:**
- Pings the Render API health endpoint
- Queries the database to keep Aiven MySQL active
- Fails the workflow if either service is unreachable

**Usage:** ~1 minute per run = ~60 minutes/month

### 2. backend-tests.yml

**Purpose:** Validates Python backend code quality and functionality

**Trigger:** Push/PR to main or develop (when backend files change)

**What it does:**
- Tests with Python 3.11
- Checks syntax of all Python files
- Verifies imports work correctly
- Runs security scan with Bandit
- Caches pip dependencies for faster runs

**Key checks:**
- Syntax validation
- Import verification
- Security vulnerability scanning

### 3. frontend-tests.yml

**Purpose:** Validates React frontend builds successfully

**Trigger:** Push/PR to main or develop (when frontend files change)

**Trigger:** Push/PR to main or develop

**What it does:**
- Tests with Node.js 18.x and 20.x
- Runs security audit on dependencies
- Builds the production application
- Verifies build artifacts are created

**Key checks:**
- Multi-version Node.js compatibility
- npm security audit
- Production build verification
- Build size reporting

### 4. code-quality.yml

**Purpose:** Enforces code quality standards across the codebase

**Trigger:** Push/PR to main or develop

**What it does:**
- **Python linting:** flake8, black formatting check
- **JavaScript linting:** checks for console.log, debugger statements
- **Dependency security:** safety check (Python), npm audit (JavaScript)
- **Code statistics:** counts files and lines of code

**Key checks:**
- Code style compliance
- Security vulnerabilities in dependencies
- Code complexity metrics
- Codebase statistics

### 5. deployment-check.yml

**Purpose:** Validates deployment configuration before merging

**Trigger:** PR to main

**What it does:**
- Verifies Render configuration (render.yaml)
- Checks required packages in requirements.txt
- Validates Netlify configuration (netlify.toml)
- Ensures no secrets are committed
- Checks for hardcoded credentials

**Key checks:**
- Deployment files present and valid
- Required dependencies listed
- No .env files in git (except .env.example, .env.production)
- No hardcoded passwords or database URLs

### 6. pr-checks.yml

**Purpose:** Automated pull request validation and labeling

**Trigger:** PR opened, updated, or reopened

**What it does:**
- Validates PR title is descriptive
- Checks for large files (>5MB)
- Detects merge conflict markers
- Analyzes PR size (warns if >50 files)
- Auto-labels PRs based on changed files
- Generates change summary

**Auto-labels:**
- `frontend` - Changes in client-side code
- `backend` - Changes in flask-server code
- `ci/cd` - Changes in workflows
- `documentation` - Changes in .md files
- `tests` - Changes in test files

## Workflow Triggers Summary

| Workflow | Push to main/develop | Pull Request | Scheduled | Manual |
|----------|---------------------|--------------|-----------|--------|
| keep-alive | ❌ | ❌ | ✅ (2x daily) | ✅ |
| backend-tests | ✅ | ✅ | ❌ | ✅ |
| frontend-tests | ✅ | ✅ | ❌ | ✅ |
| code-quality | ✅ | ✅ | ❌ | ✅ |
| deployment-check | ❌ | ✅ (main only) | ❌ | ✅ |
| pr-checks | ❌ | ✅ | ❌ | ❌ |

## Resource Usage

**Estimated monthly usage (public repo):**
- keep-alive: ~60 minutes
- backend-tests: ~20 minutes (varies by commits)
- frontend-tests: ~40 minutes (2 Node versions)
- code-quality: ~30 minutes
- deployment-check: ~10 minutes
- pr-checks: ~5 minutes
- **Total: ~165 minutes/month**

Public repositories get unlimited GitHub Actions minutes.

## Best Practices

1. **Before pushing:**
   - Ensure your code passes local tests
   - Run linting locally when possible
   - Check for large files

2. **Pull requests:**
   - Write descriptive titles
   - Keep PRs focused (< 50 files when possible)
   - Review workflow results before requesting review

3. **Deployment:**
   - Never commit .env files with secrets
   - Use .env.example for documentation
   - Update deployment configs when URLs change

## Manual Workflow Triggers

To manually run any workflow:
1. Go to repository → Actions tab
2. Select the workflow from the left sidebar
3. Click "Run workflow" button
4. Select branch and click "Run workflow"

## Troubleshooting

**Workflow fails on backend-tests:**
- Check Python syntax errors
- Verify all imports are available
- Review Bandit security warnings

**Workflow fails on frontend-tests:**
- Check npm dependencies are properly listed
- Review build errors in logs
- Ensure environment variables are set

**Workflow fails on deployment-check:**
- Verify render.yaml and netlify.toml exist
- Check for committed .env files
- Look for hardcoded credentials

## Future Enhancements

Potential additions to the CI/CD pipeline:

- **Automated testing:** Add unit tests for backend and frontend
- **E2E testing:** Playwright or Cypress tests
- **Performance testing:** Lighthouse CI for frontend performance
- **Automated deployments:** Deploy previews for PRs
- **Dependency updates:** Dependabot or Renovate integration
- **Code coverage:** Track test coverage metrics