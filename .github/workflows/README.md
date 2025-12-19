# GitHub Actions Workflows

This directory contains CI/CD workflows for CurriculumCrafter.

## Current Workflows

### keep-alive.yml

**Purpose:** Prevents free tier services from shutting down due to inactivity

**Schedule:** Runs twice daily (00:00 and 12:00 UTC)

**What it does:**
- Pings the Render API health endpoint
- Queries the database to keep Aiven MySQL active
- Fails the workflow if either service is unreachable

**Manual Trigger:** Can be triggered manually from the Actions tab

**Rate Limits:**
- GitHub Actions: Free tier allows 2,000 minutes/month for private repos, unlimited for public repos
- This workflow uses ~1 minute per run = ~60 minutes/month (well within limits)
- Render: No rate limit on incoming requests for free tier
- Aiven: No connection limit for free tier

**Why twice daily?**
- Aiven free tier powers down after ~3 days of inactivity
- Running twice daily ensures the database stays active
- Render spins down after 15 minutes but auto-starts on request (doesn't need frequent pings)

## Future Workflows (Planned)

Ideas for additional CI/CD workflows:

- **test.yml** - Run backend tests on pull requests
- **lint.yml** - Run linting checks on Python and JavaScript code
- **deploy.yml** - Automated deployment checks
- **security.yml** - Security scanning with Dependabot or Snyk

## Notes

- All workflows use public endpoints (no secrets required for keep-alive)
- Workflows run on GitHub-hosted Ubuntu runners
- Check the Actions tab in GitHub to see workflow runs and logs