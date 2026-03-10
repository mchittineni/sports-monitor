# 💰 Infrastructure Cost Estimate Report

**Total Monthly Cost: $273.48**
*Usage-based costs are estimates; actual billing may vary based on traffic.*

---

## 🏗️ Project Summary

| Project | Baseline Cost | Usage Cost | Total Cost |
| :--- | :--- | :--- | :--- |
| **terraform-prod** | $154.50 | - | **$154.50** |
| **terraform-staging** | $59.49 | - | **$59.49** |
| **terraform-dev** | $59.49 | - | **$59.49** |
| **OVERALL TOTAL** | | | **$273.48** |

---

## 🔴 Production Environment (`terraform-prod`)
**Total: $154.50/mo**

### 🗄️ Databases
* **RDS PostgreSQL Instance** (Multi-AZ, db.t3.medium): **$105.85**
* **Storage** (gp3, 20GB): **$4.60**
* *Performance Insights & Backups: Usage-based*

### 🌐 Networking & Security
* **NAT Gateway**: **$32.85** (730 hours)
* **WAF Web ACL**: **$5.00**
* *Data Processing & WAF Requests: Usage-based*

### 🔐 Encryption (KMS)
* **6 Customer Master Keys** (RDS, S3, SNS, DynamoDB, Logs, VPC Flow): **$6.00** ($1.00/ea)

---

## 🟠 Staging & Dev Environments
**Total: $59.49/mo (per environment)**

### 🗄️ Databases
* **RDS PostgreSQL Instance** (Single-AZ, db.t3.micro): **$13.14**
* **Storage** (gp3, 20GB): **$2.30**

### 🌐 Networking & Security
* **NAT Gateway**: **$32.85**
* **WAF Web ACL**: **$5.00**

### 🔐 Encryption (KMS)
* **6 Customer Master Keys**: **$6.00**

---

## 📊 Usage-Based Components (All Environments)
*The following resources are provisioned but billed primarily on activity:*

| Service | Component | Unit Price |
| :--- | :--- | :--- |
| **API Gateway** | Requests | $1.00 per 1M requests |
| **Lambda** | Compute Duration | $0.00001667 per GB-sec |
| **CloudFront** | Data Transfer | $0.085 per GB (US/EU) |
| **S3** | Storage/Requests | $0.023 per GB |
| **DynamoDB** | Read/Write Units | $1.25 per 1M WRU / $0.25 per 1M RRU |
| **CloudWatch** | Logs Ingested | $0.50 per GB |
| **SNS** | Email Notifications | $2.00 per 100k (after 1k free) |

---

> [!NOTE]
> **Resource Detection:** 246 cloud resources detected. 66 estimated, 180 free.
> Estimates generated via Infracost. For detailed breakdowns, check the full CLI output.