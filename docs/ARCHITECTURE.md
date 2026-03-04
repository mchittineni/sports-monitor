# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      End Users (Browser)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  CloudFront CDN (Edge Locations)                                │
│  - Static asset delivery                                        │
│  - Cache optimization                                            │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  S3 (Frontend Assets)                                           │
│  - React build output                                           │
│  - Images, fonts, static files                                  │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ REST API + WebSocket
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  AWS API Gateway                                                │
│  - Request routing                                              │
│  - Rate limiting                                                │
│  - CORS handling                                                │
└───────────────────┬────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
    Lambda              WebSocket
   Functions           Connections
        │                       │
        └───────────┬───────────┘
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Application Layer (Node.js)                                    │
│  - Business logic                                               │
│  - Route handlers                                               │
│  - Data processing                                              │
└───────────────────┬────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬──────────────────┐
        ▼           ▼           ▼                  ▼
    PostgreSQL   DynamoDB    Redis         AWS Bedrock
    (RDS)        (Events)    (Cache)       (AI Models)
    - Users      - Live      - Session     - Claude 3
    - Teams      Events      Cache         - Insights
    - Matches    - Fast      - Rate Limit  - Predictions
    - History    queries     Data
                 - TTL       
                 Cleanup

Monitoring & Logging:
┌──────────────────┬──────────────────┬──────────────────┐
│  CloudWatch      │   X-Ray          │   SNS Alerts     │
│  - Logs          │   - Tracing      │   - Email        │
│  - Metrics       │   - Performance  │   - SMS          │
│  - Alarms        │   - Dependencies │   - Webhooks     │
└──────────────────┴──────────────────┴──────────────────┘
```

## Data Flow

### 1. Real-time Sports Data Pipeline
```
External APIs (ESPN, TheSportsDB)
         ↓
   EventBridge (Scheduler)
         ↓
   Lambda Functions
         ↓
   DynamoDB (Hot data)
         ↓
   WebSocket → Browser Updates
```

### 2. User Interaction Flow
```
User clicks country on map
         ↓
   Frontend API call
         ↓
   API Gateway + Lambda
         ↓
   Query DynamoDB/PostgreSQL
         ↓
   AI Service (Optional summarization)
         ↓
   Return to frontend
         ↓
   Real-time update via WebSocket
```

### 3. AI Processing Pipeline
```
User message or match data
         ↓
   Lambda receives request
         ↓
   Call Bedrock API
         ↓
   Claude 3 Inference
         ↓
   Stream or return response
         ↓
   Cache result (optional)
         ↓
   Return to user
```

## Deployment Architecture

### Development Environment
```
GitHub (main branch)
    ↓
GitHub Actions
    ├─ Test & Lint
    ├─ Build Docker images
    ├─ Push to ECR
    └─ Trigger Terraform
         ↓
    Terraform Plan & Apply
         ├─ VPC & Networking
         ├─ RDS PostgreSQL
         ├─ DynamoDB
         ├─ Lambda Functions
         ├─ API Gateway
         └─ CloudFront + S3
         ↓
    AWS Resources (DEV)
```

### Staging → Production
- Separate Terraform workspaces
- Blue-green deployments
- Canary releases
- Automated rollback on failures

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AWS Account (DEV)                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  VPC (10.0.0.0/16)                                 │    │
│  │                                                     │    │
│  │  Public Subnets (NAT for outbound)                │    │
│  │  ├─ API Gateway                                   │    │
│  │  └─ Lambda (API layer)                            │    │
│  │                                                     │    │
│  │  Private Subnets                                  │    │
│  │  ├─ RDS PostgreSQL (encrypted)                    │    │
│  │  ├─ DynamoDB (VPC endpoint)                       │    │
│  │  └─ ElastiCache Redis                            │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Security layers:                                           │
│  - IAM roles (least privilege)                             │
│  - Security groups (port restrictions)                     │
│  - KMS encryption (at-rest)                               │
│  - TLS/SSL (in-transit)                                   │
│  - Secrets Manager (credentials)                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Scaling Strategy

### Horizontal Scaling
- **API Gateway**: Auto-scales with traffic (managed)
- **Lambda**: Concurrent execution limits (configurable)
- **DynamoDB**: On-demand pricing (auto-scales)
- **PostgreSQL RDS**: Read replicas for analytics

### Vertical Scaling
- Lambda memory: 128MB → 10GB (improves CPU)
- RDS instance: t3.micro → t3.medium → r6i instance family

### Database Optimization
- PostgreSQL: Connection pooling, indexing, query optimization
- DynamoDB: GSI for frequent queries, TTL for cleanup
- Redis: Eviction policies, replication

## Cost Optimization

| Component | DEV Cost | Strategy |
|-----------|----------|----------|
| Lambda | Variable | On-demand pricing |
| RDS | ~$30/mo | t3.micro instance |
| DynamoDB | Variable | On-demand billing |
| API Gateway | ~$0.35/M | Caching layer |
| S3 + CloudFront | <$5/mo | S3 lifecycle policies |
| **Total** | **~$100-200/mo** | Reserved instances for prod |

## Disaster Recovery

```
Backup Strategy:
- RDS: Automated backups (35-day retention, prod)
- DynamoDB: Point-in-time recovery enabled
- Code: GitHub repository backups
- Terraform state: Versioned in S3

Recovery Plan (RTO: 4 hours, RPO: 1 hour):
1. Detect failure via CloudWatch alarms
2. Analyze root cause with X-Ray
3. Restore from latest backup
4. Validate with health checks
5. Notify team via SNS
6. Post-mortem analysis
```

---

For detailed setup instructions, see [README.md](../README.md)
