# 🏥 MediTrack — Healthcare Patient Monitoring System

> A production-grade full-stack web application with a complete DevOps pipeline.
> Built with Node.js, HTML/CSS/JS, Docker, Kubernetes, Jenkins, Terraform, Prometheus, and Grafana.

---

## 📋 Project Description

**MediTrack** is a hospital patient monitoring system that allows medical staff to:
- Admit and discharge patients
- Track patient vitals (heart rate, blood pressure, SpO₂, temperature, respiratory rate)
- Monitor real-time system health via Grafana dashboards
- Filter patients by ward, status, or name

The application is deployed using a full DevOps pipeline — every code change is automatically tested, containerised, and deployed to Kubernetes with zero downtime.

---

## 📁 Project Structure

```
meditrack/
├── backend/                        # Node.js REST API
│   ├── src/
│   │   ├── server.js               # Entry point
│   │   ├── app.js                  # Express setup, middleware, routes
│   │   ├── models/store.js         # In-memory data store + seed data
│   │   ├── routes/
│   │   │   ├── patients.js         # CRUD for patients
│   │   │   ├── vitals.js           # Record & retrieve vitals
│   │   │   ├── health.js           # /api/health endpoint
│   │   │   └── metrics.js          # /metrics (Prometheus)
│   │   └── middleware/
│   │       └── metrics.js          # Prometheus counters, histograms, gauges
│   ├── tests/api.test.js           # Full Jest test suite (17 tests)
│   └── package.json
│
├── frontend/
│   └── index.html                  # Full SPA dashboard (vanilla HTML/CSS/JS)
│
├── Dockerfile                      # Multi-stage Docker build for backend
├── docker-compose.yml              # Local: backend + frontend + Prometheus + Grafana
├── Jenkinsfile                     # CI/CD: test → build → push → deploy
│
├── k8s/
│   ├── deployment.yaml             # 2-replica deployment, rolling updates
│   ├── service.yaml                # ClusterIP (API) + LoadBalancer (frontend)
│   └── hpa.yaml                    # Auto-scale 2–10 pods on CPU/memory
│
├── terraform/
│   ├── main.tf                     # AWS EC2 + security group + user_data bootstrap
│   ├── variables.tf
│   └── outputs.tf                  # Prints all service URLs after apply
│
└── monitoring/
    ├── prometheus/prometheus.yml   # Scrapes /metrics every 10s
    └── grafana/provisioning/
        └── datasources/
            └── prometheus.yml      # Auto-wires Grafana → Prometheus
```

---

## 🛠️ DevOps Tools — Role in MediTrack

| Tool | Why it's used in this project |
|---|---|
| **Docker** | Packages MediTrack into containers so it runs identically on every machine. Non-root user, health checks built in. |
| **Kubernetes** | Runs 2 replicas in production. If a pod crashes, Kubernetes restarts it automatically. Patients never lose access. Rolling updates = zero downtime deployments. |
| **Jenkins** | Automatically tests and deploys every code push. No manual deployments — critical in healthcare where human error is unacceptable. |
| **Terraform** | Creates the entire AWS infrastructure from a single command. Reproducible, auditable — required for hospital compliance. |
| **Prometheus** | Scrapes `/metrics` every 10s. Tracks active patients, critical patient count, HTTP errors, and response times. |
| **Grafana** | Dashboard visible to hospital IT staff. Alerts can be configured if the API goes down or error rates spike. |

---

## ⚡ Quick Start (Local Dev)

```bash
# 1. Clone
git clone <your-repo-url>
cd meditrack

# 2. Start the full stack
docker-compose up --build

# 3. Access services
#   Frontend  →  http://localhost:80
#   API       →  http://localhost:5000/api
#   Health    →  http://localhost:5000/api/health
#   Prometheus→  http://localhost:9090
#   Grafana   →  http://localhost:3001  (admin / admin123)
```

---

## 🧪 Running Tests

```bash
cd backend
npm install
npm test
```

Test suite covers: health endpoint, all patient CRUD operations, vitals recording, metrics endpoint, and validation errors. (17 test cases)

---

## 🔄 CI/CD Pipeline (Jenkins)

```
Git Push
   ↓
Jenkins detects change
   ↓
npm ci → npm test (all 17 tests must pass)
   ↓
docker build (multi-stage)
   ↓  [main branch only]
docker push → Docker Hub
   ↓
kubectl apply -f k8s/
   ↓
kubectl rollout status (waits for 2 new pods to be healthy)
   ↓
✅ Zero-downtime deploy complete
```

**Setup Jenkins credentials:**
- `dockerhub-credentials` — Docker Hub username + password
- `kubeconfig` — Secret file: your `~/.kube/config`

---

## ☁️ Cloud Deployment (Terraform)

```bash
cd terraform
terraform init
terraform plan
terraform apply -var="key_name=your-ec2-keypair"

# Output:
# frontend_url   = http://<ip>
# api_url        = http://<ip>:5000/api
# grafana_url    = http://<ip>:3001
# prometheus_url = http://<ip>:9090
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | System health check |
| GET | `/api/patients` | List all patients (supports ?ward=, ?status=, ?search=) |
| GET | `/api/patients/stats` | Summary counts (total, critical, stable, recovering) |
| GET | `/api/patients/:id` | Get one patient |
| POST | `/api/patients` | Admit a new patient |
| PUT | `/api/patients/:id` | Update patient (status, ward, doctor etc.) |
| DELETE | `/api/patients/:id` | Discharge a patient |
| GET | `/api/vitals/:patientId` | Get all vitals for a patient |
| POST | `/api/vitals/:patientId` | Record new vitals |
| GET | `/metrics` | Prometheus metrics scrape endpoint |

---

## 📊 Prometheus Metrics Exposed

| Metric | Type | Description |
|---|---|---|
| `meditrack_http_requests_total` | Counter | Total HTTP requests by method/route/status |
| `meditrack_http_request_duration_seconds` | Histogram | Request latency distribution |
| `meditrack_active_patients_total` | Gauge | Current number of admitted patients |
| `meditrack_critical_patients_total` | Gauge | Patients in critical condition |
| `process_cpu_seconds_total` | Counter | Node.js process CPU (default) |
| `nodejs_heap_size_used_bytes` | Gauge | Memory usage (default) |

---

## 👨‍💻 Tech Stack

- **Backend**: Node.js 20, Express 4, prom-client, express-validator, helmet, cors
- **Frontend**: Vanilla HTML5 / CSS3 / JavaScript (no framework — fast, lightweight)
- **Testing**: Jest + Supertest
- **Containerisation**: Docker (multi-stage), Docker Compose
- **Orchestration**: Kubernetes (Deployment, Service, HPA)
- **CI/CD**: Jenkins (Declarative Pipeline)
- **Infrastructure**: Terraform → AWS EC2
- **Monitoring**: Prometheus + Grafana
