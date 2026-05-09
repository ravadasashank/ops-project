pipeline {
    agent any

    environment {
        APP_NAME   = 'meditrack'
        IMAGE_NAME = 'ops-backend'
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('📥 Checkout') {
            steps {
                checkout scm
                echo "Build Number: ${env.BUILD_NUMBER}"
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('🐳 Build Docker Image') {
            steps {
                bat """
                    docker build -t %IMAGE_NAME%:%IMAGE_TAG% .
                    docker build -t %IMAGE_NAME%:latest .
                """
            }
        }

        stage('☸️ Deploy to Kubernetes') {
            steps {
                bat 'kubectl apply --validate=false -f deployment.yaml'
            }
        }

        stage('✅ Verify Pods') {
            steps {
                bat 'kubectl get pods'
            }
        }
    }

    post {

        success {
            echo '✅ MediTrack deployed successfully!'
        }

        failure {
            echo '❌ Pipeline failed.'
        }

        always {
            bat 'docker images'
        }
    }
}