# Artifact Registry para Docker images
resource "google_artifact_registry_repository" "docker" {
  location      = var.region
  repository_id = "devops-app"
  format        = "DOCKER"
  description   = "Docker repository for DevOps project"

  depends_on = [google_project_service.apis]
}
