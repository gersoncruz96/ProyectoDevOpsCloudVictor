# Proyecto Final - Sistemas Operativos II
## Implementación de una Infraestructura DevOps en la Nube

### Descripción
Infraestructura moderna basada en prácticas DevOps desplegada en Google Cloud Platform (GCP) utilizando Kubernetes, Docker, Terraform y GitHub Actions.

### Tecnologías
- **Cloud**: Google Cloud Platform (GKE)
- **IaC**: Terraform
- **Contenedores**: Docker
- **Orquestación**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoreo**: Prometheus + Grafana
- **Seguridad**: Cloud Armor, IAM, Secret Manager

### Estructura del Proyecto
```
├── app/                    # Aplicación Node.js
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── test.js
├── terraform/              # Infraestructura como Código
│   ├── main.tf
│   ├── vpc.tf
│   ├── gke.tf
│   ├── registry.tf
│   ├── variables.tf
│   └── outputs.tf
├── k8s/                    # Manifiestos Kubernetes
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
├── monitoring/             # Prometheus + Grafana
│   ├── prometheus.yaml
│   └── grafana.yaml
├── .github/workflows/      # CI/CD Pipeline
│   └── deploy.yml
├── diagramas/              # Diagramas de arquitectura
└── README.md
```

### Despliegue

#### 1. Configurar GCP
```bash
gcloud auth login
gcloud config set project TU_PROJECT_ID
```

#### 2. Desplegar infraestructura
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars con tu project ID
terraform init
terraform plan
terraform apply
```

#### 3. Conectar al cluster
```bash
gcloud container clusters get-credentials devops-cluster --zone us-central1-a
```

#### 4. Desplegar app manualmente (o via CI/CD)
```bash
kubectl apply -f k8s/
kubectl apply -f k8s/namespace-monitoring.yaml
kubectl apply -f monitoring/
```

### Endpoints
- `/` - Dashboard principal
- `/health` - Health check
- `/metrics` - Métricas Prometheus
- `/api/info` - Info del sistema

### Autores
- Proyecto Final - Sistemas Operativos II
