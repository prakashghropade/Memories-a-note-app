pipeline {
    agent any
    
    parameters {
        string (
            name: 'IMAGE_TAG',
            defaultValue: 'latest',
            description: 'Docker image tag, for example v1, v1, 1.0.0'
            )
        
        string (
            name: 'API_URL',
            defaultValue: 'http://43.205.116.80:30002/',
            description: 'Backend API URL for the  frontend'
            )
    }
    
    environment{
        DOCKERHUB_CREDENTIALS = 'dockerhubcred'
        DOCKERHUB_USERNAME = 'prakashghorpade2001'
        
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/memories-notes-app-frontend"
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/memories-notes-app-backend"
    }
    
    
    stages {
        
        stage('Checkout') {
        
                   steps {
              sh '''
            if [ -d "Memories-a-note-app/.git" ]; then
                echo "Repository already exists. Pulling latest code..."
                cd Memories-a-note-app
                git pull origin main
            else
                echo "Repository not found. Cloning..."
                rm -rf Memories-a-note-app
                git clone https://github.com/prakashghropade/Memories-a-note-app.git
            fi
        '''
    }
            
        }
        
        stage('Build Backend Image'){
            steps{
            echo "Building backend image: ${BACKEND_IMAGE}:${IMAGE_TAG}"
            
            sh  """
            docker build \
            -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
            Memories-a-note-app/server/
            """
            }
        }
        
        stage('Build Frontend Image'){
            steps{ 
                echo  "Building frontend image with API  URL: ${API_URL}"
                
                sh """
                docker build \
                --build-arg REACT_APP_API_URL=${API_URL} \
                -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
               Memories-a-note-app/frontend/
                """
            }
        }
        
       stage('Push Images') {
    steps {
        withCredentials([
            usernamePassword(
                credentialsId: 'dockerhubcred',
                usernameVariable: 'DOCKERHUB_USERNAME',
                passwordVariable: 'DOCKER_PASSWORD'
            )
        ]) {
            sh '''
                echo "$DOCKER_PASSWORD" | docker login \
                    -u "$DOCKERHUB_USERNAME" \
                    --password-stdin

                docker push "$BACKEND_IMAGE:$IMAGE_TAG"
                docker push "$FRONTEND_IMAGE:$IMAGE_TAG"

                docker logout
            '''
            }
        }
    }

}
    
post {
    success {
        emailext(
            subject: "CI SUCCESS - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """
                    CI Pipeline completed successfully.

                    Job: ${env.JOB_NAME}    
                    Build: ${env.BUILD_NUMBER}
                    Status: SUCCESS
                    Build URL: ${env.BUILD_URL}
                    """,
            to: "prakashghorpade901@gmail.com"
        )
    }

    failure {
        emailext(
            subject: "CI FAILED - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """
                    CI Pipeline failed.

                    Job: ${env.JOB_NAME}    
                    Build: ${env.BUILD_NUMBER}
                    Status: FAILURE
                    Build URL: ${env.BUILD_URL}
                """,
            to: "prakashghorpade901@gmail.com"
            )
        }
    }
    
}
