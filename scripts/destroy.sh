#!/bin/bash
# Script para destruir toda la infraestructura (después de la presentación)
# Uso: ./scripts/destroy.sh

set -e

echo "========================================="
echo "  ⚠️  DESTRUIR INFRAESTRUCTURA"
echo "========================================="
echo ""
echo "Esto eliminará TODO: cluster, VPC, registry, etc."
read -p "¿Estás seguro? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Cancelado."
  exit 0
fi

echo ""
echo "Eliminando recursos de Kubernetes..."
kubectl delete -f monitoring/ --ignore-not-found
kubectl delete -f k8s/ --ignore-not-found
echo ""

echo "Destruyendo infraestructura con Terraform..."
cd terraform
terraform destroy -auto-approve
cd ..

echo ""
echo "✅ Todo eliminado. Ya no se generan costos."
