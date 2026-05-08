output "server_public_ip" {
  value       = aws_instance.meditrack_server.public_ip
  description = "Public IP — open http://<this-ip> to access MediTrack"
}
output "instance_id" {
  value = aws_instance.meditrack_server.id
}
output "frontend_url"  { value = "http://${aws_instance.meditrack_server.public_ip}" }
output "api_url"       { value = "http://${aws_instance.meditrack_server.public_ip}:5000/api" }
output "grafana_url"   { value = "http://${aws_instance.meditrack_server.public_ip}:3001" }
output "prometheus_url"{ value = "http://${aws_instance.meditrack_server.public_ip}:9090" }
