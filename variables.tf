variable "aws_region"       { default = "us-east-1" }
variable "environment"      { default = "prod" }
variable "instance_type"    { default = "t3.small" }
variable "ami_id"           { default = "ami-0c55b159cbfafe1f0" }   # Ubuntu 22.04 us-east-1
variable "key_name"         { description = "Your EC2 key pair name" }
variable "ssh_allowed_cidr" { default = "0.0.0.0/0"; description = "Restrict SSH to your IP in prod" }
