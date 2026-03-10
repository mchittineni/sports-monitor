# 💰 Infrastructure Cost Estimate Report

**Total Monthly Project Cost: $159.09**
*Usage-based costs are estimates; actual billing may vary based on traffic.*

---

## 🏗️ Project Summary

| Project | Baseline Cost | Usage Cost | Total Cost |
| :--- | :--- | :--- | :--- |
| **terraform-dev** | $53.03 | - | **$53.03** |
| **terraform-Stage** | $53.03 | - | **$53.03** |
| **terraform-prod** | $53.03 | - | **$53.03** |
| **OVERALL TOTAL** | | | **$159.09** |

---

## 🔴 Production Environment (`terraform-prod`)
**Total: $53.03/mo**

### 🗄️ Databases
* **RDS PostgreSQL Instance** (Single-AZ, db.t4g.micro): **$11.68**
* **Storage** (gp3, 20GB): **$2.30**
* *Performance Insights & Backups: Usage-based*

### 🌐 Networking & Security
* **NAT Gateway**: **$32.85** (730 hours)
* **WAF Web ACL**: **$5.00**
* *Data Processing & WAF Requests: Usage-based*

### 🔐 Encryption (KMS)
* **Shared Customer Master Key**: **$1.00** (Consolidated across all modules)

---

## 🟠 Stage & Dev Environments
**Total: $53.03/mo (per environment)**

### 🗄️ Databases
* **RDS PostgreSQL Instance** (Single-AZ, db.t4g.micro): **$11.68**
* **Storage** (gp3, 20GB): **$2.30**

### 🌐 Networking & Security
* **NAT Gateway**: **$32.85**
* **WAF Web ACL**: **$5.00**

### 🔐 Encryption (KMS)
* **Shared Customer Master Key**: **$1.00**

---

## 📊 Usage-Based Components (All Environments)
*The following resources are provisioned but billed primarily on activity:*

| Service | Component | Unit Price |
| :--- | :--- | :--- |
| **API Gateway** | Requests | $1.00 per 1M requests |
| **Lambda** | Compute Duration (ARM64) | $0.00001333 per GB-seconds |
| **CloudFront** | Data Transfer | $0.085 per GB (US/EU) |
| **S3** | Storage/Requests | $0.023 per GB |
| **DynamoDB** | Read/Write Units | $1.25 per 1M WRUs / $0.25 per 1M RRUs |
| **CloudWatch** | Logs Ingested | $0.50 per GB |
| **SNS** | Email Notifications | $2.00 per 100k (after 1k free) |

---

> [!NOTE]
> **Resource Detection:** 216 cloud resources detected. 51 estimated, 165 free.
> **Optimization Wins:** Moving to **Shared KMS Keys** saved **$15.00/month** across the project. Switching to **Graviton (t4g)** instances and ARM64 runtimes further reduced database and Lambda baseline costs.
> Estimates generated via Infracost. For detailed breakdowns, check the full CLI output.