terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "meditrack-tfstate"
    key    = "meditrack/prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# ── Security Group ──────────────────────────────────────────────────────────
resource "aws_security_group" "meditrack_sg" {
  name        = "meditrack-sg-${var.environment}"
  description = "MediTrack application security group"

  ingress {
    description = "SSH"
    from_port   = 22; to_port = 22; protocol = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }
  ingress {
    description = "HTTP Frontend"
    from_port   = 80; to_port = 80; protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Backend API"
    from_port   = 5000; to_port = 5000; protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Prometheus"
    from_port   = 9090; to_port = 9090; protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Grafana"
    from_port   = 3001; to_port = 3001; protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0; to_port = 0; protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "meditrack-sg", Environment = var.environment, Project = "MediTrack" }
}

# ── EC2 Instance ────────────────────────────────────────────────────────────
resource "aws_instance" "meditrack_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.meditrack_sg.id]

  user_data = <<-EOF
    #!/bin/bash
    set -e
    apt-get update -y
    apt-get install -y docker.io docker-compose git curl

    # Enable and start Docker
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu

    # Pull and start MediTrack
    cd /home/ubuntu
    git clone https://github.com/yourorg/meditrack.git
    cd meditrack
    docker-compose up -d

    echo "MediTrack started successfully" > /var/log/meditrack-setup.log
  EOF

  tags = {
    Name        = "meditrack-server-${var.environment}"
    Environment = var.environment
    Project     = "MediTrack"
  }
}
