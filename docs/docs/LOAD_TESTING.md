# Load Testing Guide

This guide explains how to perform load testing on your Enterprise BOS deployment to validate performance and identify bottlenecks.

## Prerequisites

- Node.js 18+
- [k6](https://k6.io/docs/getting-started/installation/) or [Artillery](https://www.artillery.io/)
- Running instance of the application
- Test database (separate from production)

## Quick Start with k6

### Installation

```bash
# macOS
brew install k6

# Windows
choco install k6

# Linux
sudo apt-get install k6
```

### Basic Load Test

Create `tests/load/basic.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up to 20 users
    { duration: '1m', target: 20 },    // Stay at 20 users
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '1m', target: 50 },    // Stay at 50 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // Less than 1% failure rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test public endpoints
  const landing = http.get(`${BASE_URL}/`);
  check(landing, {
    'landing page status is 200': (r) => r.status === 200,
  });

  // Test API health
  const health = http.get(`${BASE_URL}/api/health`);
  check(health, {
    'health check is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

### Run Load Test

```bash
k6 run --env BASE_URL=http://localhost:3000 tests/load/basic.js
```

## Authenticated Load Test

Create `tests/load/authenticated.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  // Login and get token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'demo@example.com',
    password: 'demo123456',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const token = loginRes.json('token');
  return { token };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Test dashboard data
  const dashboard = http.get(`${BASE_URL}/api/dashboard/stats`, { headers });
  check(dashboard, {
    'dashboard loads': (r) => r.status === 200,
    'dashboard response time OK': (r) => r.timings.duration < 500,
  });

  // Test projects list
  const projects = http.get(`${BASE_URL}/api/projects`, { headers });
  check(projects, {
    'projects load': (r) => r.status === 200,
  });

  sleep(2);
}
```

## Expected Performance Benchmarks

| Endpoint | p50 | p95 | p99 | Target RPS |
|----------|-----|-----|-----|------------|
| Landing Page | \<100ms | \<300ms | \<500ms | 100 |
| API Health | \<50ms | \<100ms | \<200ms | 500 |
| Dashboard Stats | \<200ms | \<500ms | \<1000ms | 50 |
| Project List | \<150ms | \<400ms | \<800ms | 100 |
| AI Chat (streaming) | \<2000ms | \<5000ms | \<10000ms | 10 |

## Database Performance

### Query Performance Tips

1. **Use indexes** - Schema includes indexes on frequently queried columns
2. **Limit result sets** - Always paginate large queries
3. **Cache expensive queries** - Use `dbCache` helper for dashboard stats

### Connection Pooling

For Neon/Supabase, connection pooling is handled by the provider. For self-hosted PostgreSQL:

```typescript
// Recommended pool settings for 50 concurrent users
{
  max: 20,           // Maximum connections
  idleTimeoutMs: 30000,
  connectionTimeoutMs: 2000,
}
```

## Monitoring During Tests

### Vercel Dashboard
- Real-time function invocations
- Cold start frequency
- Error rates

### Database Metrics
- Active connections
- Query duration
- Cache hit ratio

### Application Logs
```bash
# Watch structured logs during test
npm run dev 2>&1 | jq '.'
```

## Scaling Recommendations

| Users | Infrastructure |
|-------|----------------|
| 1-100 | Vercel Hobby + Neon Free |
| 100-1000 | Vercel Pro + Neon Pro |
| 1000-10000 | Vercel Pro + Neon Scale + Redis |
| 10000+ | Dedicated infrastructure |

## CI/CD Integration

Add to `.github/workflows/load-test.yml`:

```yaml
name: Load Test
on:
  schedule:
    - cron: '0 2 * * 1'  # Weekly Monday 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/load/basic.js
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
```

## Troubleshooting

### High Response Times
1. Check database query performance
2. Review N+1 queries
3. Enable caching for repeated queries
4. Check cold start frequency

### High Error Rates
1. Review rate limiting configuration
2. Check database connection limits
3. Validate authentication token expiry
4. Review error logs in Sentry
