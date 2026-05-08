pipeline {
    agent any

    environment {
        APP_NAME     = 'meditrack'
        IMAGE_NAME   = 'meditrack-backend'
        IMAGE_TAG    = "${env.BUILD_NUMBER}"
        DOCKER_CREDS = credentials('dockerhub-credentials')
        KUBECONFIG   = credentials('kubeconfig')
    }

    stages {

        stage('📥 Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME} | Build: #${env.BUILD_NUMBER}"
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                dir('backend') { sh 'npm ci' }
            }
        }

        stage('🧪 Run Tests') {
            steps {
                dir('backend') {
                    sh 'npm test -- --ci --forceExit'
                }
            }
            post {
                always {
                    // Archive test results if jest-junit reporter is added
                    echo 'Tests complete.'
                }
            }
        }

        stage('🐳 Build Docker Image') {
            steps {
                sh """
                    docker build \
                      -f Dockerfile \
                      -t ${IMAGE_NAME}:${IMAGE_TAG} \
                      -t ${IMAGE_NAME}:latest \
                      ./backend
                """
            }
        }

        stage('🚀 Push to Docker Hub') {
            when { branch 'main' }
            steps {
                sh """
                    echo "${DOCKER_CREDS_PSW}" | docker login -u "${DOCKER_CREDS_USR}" --password-stdin
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_CREDS_USR}/${IMAGE_NAME}:${IMAGE_TAG}
                    docker tag ${IMAGE_NAME}:latest       ${DOCKER_CREDS_USR}/${IMAGE_NAME}:latest
                    docker push ${DOCKER_CREDS_USR}/${IMAGE_NAME}:${IMAGE_TAG}
                    docker push ${DOCKER_CREDS_USR}/${IMAGE_NAME}:latest
                """
            }
        }

        stage('☸️ Deploy to Kubernetes') {
            when { branch 'main' }
            steps {
                sh """
                    sed -i 's|IMAGE_TAG_PLACEHOLDER|${IMAGE_TAG}|g' k8s/deployment.yaml
                    kubectl apply -f k8s/
                    kubectl rollout status deployment/meditrack-backend --timeout=120s
                """
            }
        }
    }

    post {
        success {
            echo "✅ MediTrack #${IMAGE_TAG} deployed successfully!"
        }
        failure {
            echo "❌ Pipeline failed on branch ${env.BRANCH_NAME}. Check logs."
        }
        always {
            sh 'docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true'
            sh 'docker logout || true'
        }
    }
}
