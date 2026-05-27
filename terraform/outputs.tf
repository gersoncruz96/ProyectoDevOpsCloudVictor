output "cluster_name" {
  value = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  value     = google_container_cluster.primary.endpoint
  sensitive = true
}

output "region" {
  value = var.region
}

output "zone" {
  value = var.zone
}

output "project_id" {
  value = var.project_id
}

output "registry_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/devops-app"
}
