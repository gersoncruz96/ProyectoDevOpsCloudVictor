#!/bin/bash
# Script de setup inicial para el proyecto DevOps
# Uso: ./scripts/setup.sh

set -e

echo "========================================="
echo "  Setup - Proyecto DevOps GCP + GKE"
echo "========================================="
echo ""

# Verificar herramientas
echo "Verificando herramientas instaladas..."
command -v gcloud >/dev/null 2>&1 || { echo "❌ gcloud no instalado. Run: brew install google-cloud-sdk"; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo "❌ terraform no instalado. Run: brew install terraform"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl no instalado. Run: brew install kubectl"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ docker no instalado. Run: brew install --cask docker"; exit 1; }
echo "✅ Todas las herramientas instaladas"
echo ""

# Login GCP
echo "Autenticando con Google Cloud..."
gcloud auth login
gcloud auth application-default login
echo ""

# Pedir Project ID
read -p "Ingresa tu GCP Project ID: " PROJECT_ID
gcloud config set project $PROJECT_ID
echo ""

# Habilitar APIs
echo "Habilitando APIs necesarias..."
gcloud services enable container.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
echo "✅ APIs habilitadas"
echo ""

# Crear terraform.tfvars
echo "Creando terraform.tfvars..."
cat > terraform/terraform.tfvars << EOF
project_id   = "$PROJECT_ID"
region       = "us-central1"
zone         = "us-central1-a"
cluster_name = "devops-cluster"
node_count   = 2
machine_type = "e2-medium"
EOF
echo "✅ terraform.tfvars creado"
echo ""

# Terraform
echo "Desplegando infraestructura con Terraform..."
cd terraform
terraform init
terraform plan
echo ""
read -p "¿Aplicar cambios? (yes/no): " APPLY
if [ "$APPLY" = "yes" ]; then
  terraform apply -auto-approve
  echo "✅ Infraestructura desplegada"
fi
cd ..
echo ""

# Conectar al cluster
echo "Conectando al cluster GKE..."
gcloud container clusters get-credentials devops-cluster --zone us-central1-a --project $PROJECT_ID
echo "✅ Conectado al cluster"
echo ""

# Build y push Docker image
echo "Construyendo imagen Docker..."
REGISTRY="us-central1-docker.pkg.dev/$PROJECT_ID/devops-app"
gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
docker build -t $REGISTRY/devops-app:latest ./app
docker push $REGISTRY/devops-app:latest
echo "✅ Imagen publicada en Artifact Registry"
echo ""

# Deploy a Kubernetes
echo "Desplegando en Kubernetes..."
sed -i.bak "s|IMAGE_PLACEHOLDER|$REGISTRY/devops-app:latest|g" k8s/deployment.yaml
kubectl apply -f k8s/namespace-monitoring.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/network-policy.yaml
kubectl apply -f monitoring/prometheus.yaml
kubectl apply -f monitoring/grafana.yaml
echo "✅ App desplegada"
echo ""

# Esperar
echo "Esperando que los pods estén listos..."
kubectl rollout status deployment/devops-app --timeout=120s
echo ""

# Mostrar info
echo "========================================="
echo "  ✅ DESPLIEGUE COMPLETO"
echo "========================================="
echo ""
kubectl get svc devops-app-service
echo ""
echo "Espera 1-2 minutos para que el LoadBalancer asigne IP externa"
echo "Luego accede a la IP EXTERNAL-IP en tu navegador"
echo ""
echo "Prometheus: kubectl get svc prometheus -n monitoring"
echo "Grafana:    kubectl get svc grafana -n monitoring (user: admin, pass: admin123)"
