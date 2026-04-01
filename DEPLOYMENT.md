# Deployment Guide — AOP Platform

Production URL: `https://portal.exerraai.com`
GitHub: `https://github.com/Arqamz/upwork-agency`

## Architecture

```
Internet → Namecheap DNS (CNAME) → ALB (HTTPS via ACM)
                                    ├── /api/* → Backend (ECS Fargate)
                                    └── /*     → Frontend (ECS Fargate)
                                                    ↓
                                              RDS PostgreSQL
```

## AWS Resources Checklist

Create these in `us-east-1` (or your preferred region):

### 1. ECR Repositories

```bash
aws ecr create-repository --repository-name aop/backend --region us-east-1
aws ecr create-repository --repository-name aop/frontend --region us-east-1
```

### 2. RDS PostgreSQL

- **Console** → RDS → Create database
- Engine: PostgreSQL 16
- Template: Free tier
- Instance: `db.t4g.micro`
- Storage: 20 GB gp3
- DB instance identifier: `aop-db`
- Master username: `aop_admin`
- Master password: (generate and save securely)
- **Connectivity**: Default VPC, NO public access
- Security group: Create new `aop-rds-sg` (we'll configure rules after ECS is set up)
- Initial database name: `aop`

### 3. ACM Certificate

- **Console** → Certificate Manager → Request certificate
- Domain: `portal.exerraai.com`
- Validation: DNS
- Copy the CNAME name/value that ACM provides
- Go to **Namecheap** → Domain → Advanced DNS → Add record:
  - Type: CNAME
  - Host: (the `_xxxxx.portal` part from ACM)
  - Value: (the `_xxxxx.acm-validations.aws` value from ACM)
- Wait for validation (usually 5-30 minutes)

### 4. Security Groups

Create in the default VPC:

**`aop-alb-sg`** (for ALB):

- Inbound: TCP 80 from 0.0.0.0/0, TCP 443 from 0.0.0.0/0
- Outbound: All traffic

**`aop-ecs-sg`** (for ECS tasks):

- Inbound: TCP 3000 from `aop-alb-sg`, TCP 3001 from `aop-alb-sg`
- Outbound: All traffic

**`aop-rds-sg`** (update the one created with RDS):

- Inbound: TCP 5432 from `aop-ecs-sg`
- Outbound: All traffic

### 5. Application Load Balancer

- **Console** → EC2 → Load Balancers → Create ALB
- Name: `aop-alb`
- Scheme: Internet-facing
- Subnets: Select all AZs in default VPC
- Security group: `aop-alb-sg`

**Target Groups:**

- `aop-backend-tg`: Target type IP, port 3001, health check `GET /api` (200 OK)
- `aop-frontend-tg`: Target type IP, port 3000, health check `GET /` (200 OK)

**Listeners:**

- Port 80 → Redirect to HTTPS 443
- Port 443 → Default action: forward to `aop-frontend-tg`
  - Add rule: Path pattern `/api/*` → forward to `aop-backend-tg`
  - Certificate: select the ACM cert for `portal.exerraai.com`

### 6. ECS Cluster

```bash
aws ecs create-cluster --cluster-name aop-cluster --region us-east-1
```

### 7. IAM Roles

**ECS Task Execution Role** (`aop-ecs-execution-role`):

- Trust: `ecs-tasks.amazonaws.com`
- Policies: `AmazonECSTaskExecutionRolePolicy` + inline policy for SSM:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ssm:GetParameters", "ssm:GetParameter"],
      "Resource": "arn:aws:ssm:us-east-1:*:parameter/aop/prod/*"
    }
  ]
}
```

**ECS Task Role** (`aop-ecs-task-role`):

- Trust: `ecs-tasks.amazonaws.com`
- Policies: S3 access for video bucket (if needed)

**GitHub Actions OIDC Role** (`aop-github-deploy`):

1. Create OIDC provider: `aws iam create-open-id-connect-provider --url https://token.actions.githubusercontent.com --client-id-list sts.amazonaws.com --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1`
2. Create role with trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:Arqamz/upwork-agency:*"
        }
      }
    }
  ]
}
```

3. Attach policies: `AmazonEC2ContainerRegistryPowerUser`, inline ECS update policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ecs:UpdateService", "ecs:DescribeServices"],
      "Resource": "*"
    }
  ]
}
```

### 8. SSM Parameter Store

Store each as SecureString under `/aop/prod/`:

```bash
aws ssm put-parameter --name /aop/prod/DATABASE_URL --value "postgresql://aop_admin:PASSWORD@aop-db.XXXXX.us-east-1.rds.amazonaws.com:5432/aop" --type SecureString
aws ssm put-parameter --name /aop/prod/JWT_SECRET --value "$(openssl rand -base64 32)" --type SecureString
aws ssm put-parameter --name /aop/prod/JWT_EXPIRATION --value "15m" --type String
aws ssm put-parameter --name /aop/prod/JWT_REFRESH_EXPIRATION --value "7d" --type String
aws ssm put-parameter --name /aop/prod/CORS_ORIGINS --value "https://portal.exerraai.com" --type String
aws ssm put-parameter --name /aop/prod/NODE_ENV --value "production" --type String
aws ssm put-parameter --name /aop/prod/PORT --value "3001" --type String
```

### 9. ECS Task Definitions

Register via JSON files or Console. Key settings:

**Backend task:**

- Family: `aop-backend`
- CPU: 512 (0.5 vCPU), Memory: 1024 (1 GB)
- Container: image `ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/aop/backend:latest`, port 3001
- Environment from SSM: DATABASE_URL, JWT_SECRET, JWT_EXPIRATION, JWT_REFRESH_EXPIRATION, CORS_ORIGINS, NODE_ENV, PORT
- Execution role: `aop-ecs-execution-role`
- Task role: `aop-ecs-task-role`

**Frontend task:**

- Family: `aop-frontend`
- CPU: 256 (0.25 vCPU), Memory: 512 (0.5 GB)
- Container: image `ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/aop/frontend:latest`, port 3000
- Environment: HOSTNAME=0.0.0.0, PORT=3000
- Execution role: `aop-ecs-execution-role`

### 10. ECS Services

```bash
# Backend
aws ecs create-service \
  --cluster aop-cluster \
  --service-name aop-backend \
  --task-definition aop-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[SUBNET_IDS],securityGroups=[aop-ecs-sg-id],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=BACKEND_TG_ARN,containerName=aop-backend,containerPort=3001"

# Frontend
aws ecs create-service \
  --cluster aop-cluster \
  --service-name aop-frontend \
  --task-definition aop-frontend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[SUBNET_IDS],securityGroups=[aop-ecs-sg-id],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=FRONTEND_TG_ARN,containerName=aop-frontend,containerPort=3000"
```

---

## Namecheap DNS Setup

In Namecheap → Domain `exerraai.com` → Advanced DNS:

| Type  | Host   | Value                                     |
| ----- | ------ | ----------------------------------------- |
| CNAME | portal | aop-alb-XXXXX.us-east-1.elb.amazonaws.com |

(The ALB DNS name is shown in the EC2 → Load Balancers console)

---

## Database Migration

```bash
# 1. Export from AlwaysData
pg_dump --format=custom --no-owner --no-acl \
  -h postgresql-arqqm.alwaysdata.net -U arqqm -d arqqm_upworkbi \
  -f aop_backup.dump

# 2. Import to RDS (temporarily allow public access or use a bastion)
pg_restore --no-owner --no-acl \
  -h aop-db.XXXXX.us-east-1.rds.amazonaws.com \
  -U aop_admin -d aop \
  aop_backup.dump

# 3. Verify
psql -h aop-db.XXXXX.us-east-1.rds.amazonaws.com -U aop_admin -d aop \
  -c "SELECT count(*) FROM projects;"
```

---

## GitHub Secrets

In `github.com/Arqamz/upwork-agency` → Settings → Secrets and variables → Actions:

| Secret         | Value                                            |
| -------------- | ------------------------------------------------ |
| `AWS_ROLE_ARN` | `arn:aws:iam::ACCOUNT_ID:role/aop-github-deploy` |

No other secrets needed — the workflow uses OIDC (no access keys).

---

## Deploy

Push to `main` → GitHub Actions builds both images, pushes to ECR, triggers ECS rolling update.

```bash
git push origin main
```

---

## Rollback

ECS keeps previous task definition revisions. To rollback:

```bash
# List task definition revisions
aws ecs list-task-definitions --family-prefix aop-backend

# Update service to use previous revision
aws ecs update-service --cluster aop-cluster --service aop-backend \
  --task-definition aop-backend:PREVIOUS_REVISION
```

---

## Logs

```bash
# View backend logs
aws logs tail /ecs/aop-backend --follow

# View frontend logs
aws logs tail /ecs/aop-frontend --follow
```

---

## Cost (~$50-65/month)

| Resource                             | Monthly |
| ------------------------------------ | ------- |
| Fargate frontend (0.25 vCPU, 0.5 GB) | ~$9     |
| Fargate backend (0.5 vCPU, 1 GB)     | ~$18    |
| RDS db.t4g.micro (free tier yr 1)    | $0-13   |
| ALB                                  | ~$18    |
| ECR, S3, data transfer               | ~$3     |
