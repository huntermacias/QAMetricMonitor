## Getting Started
Follow these instructions to set up and run `QAMetricMonitor` on your local machine for development and testing purposes.

### Prerequisites
Before you begin, ensure you have the following installed on your system:

[Docker](https://docs.docker.com/desktop/setup/install/windows-install/) :
is essential for containerizing your application, ensuring consistency across different environments.


[Node.js](https://nodejs.org/en/download) (v20 or higher) and npm:
Node.js is required to run your application, and npm serves as the package manager for handling dependencies.

## Installation

**Using Docker**

1. Clone the Repository 
```sh 
git clone https://github.com/huntermacias/QAMetricMonitor.git 

cd QAMetricMontior
```

2. Build the Docker Image 
```sh 
docker build -t QAMetricMonitor .
```

3. Build with Docker compose (Optional) 
    - TODO : set this up when integrating DB 

4. Run the Docker Container 
```sh 
docker run -p 3000:3000 QAMetricMonitor
```
    | **OR** Using Docker Compose: 
```sh 
docker-compose up
```

5. Access Application 
    - Open your browser and navigate to http://localhost:3000 to view the application.

### Local Setup without Docker 


1. Clone the Repository 
```sh 
git clone https://github.com/huntermacias/QAMetricMonitor.git 

cd QAMetricMontior
```

2. Install Dependencies
    - Ensure you have the latest stable version of Node.js (v20 or higher).
```sh 
npm install
``` 

3. Run the application 
Start the development server 
```sh 
npm run dev 
```

4. Access Application 
    - Open your browser and navigate to http://localhost:3000 to view the application.


## Contributing 

1. Create a New Branch
```sh 
git checkout -b feature/feature-name 
```

2. Commit your changes 
```sh 
git add . 
git commit -m "feature: description here" 
``` 

3. Push to your fork 
```sh 
git push --set-upstream origin feature/feature-name
```

4. Create a pull request 
    - navigate to the repository on Github and submit a pull request detailing your changes. 