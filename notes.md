# Azure DevOps REST API Endpoints

This document provides an in-depth explanation of how to interact with Azure DevOps REST APIs for fetching pull requests, repositories, teams, and commits. All endpoints assume a `GET` HTTP method and are compatible with the specified API versions.

---

## **1. Get Pull Request Information by Pull Request ID**

### **Endpoint**

GET https://{instance}/{collection}/_apis/git/pullrequests/{pullRequestId}?api-version=4.1


### **Description**
This endpoint retrieves detailed information about a specific pull request using its unique `pullRequestId`.

### **Parameters**
- `{instance}`: The base URL of the Azure DevOps instance (e.g., `tfs.pacific.costcotravel.com`).
- `{collection}`: The collection name (e.g., `TestAutomation`).
- `{pullRequestId}`: The ID of the pull request you want to fetch.

### **Example**

GET https://tfs.pacific.costcotravel.com/tfs/TestAutomation/_apis/git/pullrequests/19324?api-version=4.1


### **Response**
The response includes metadata about the pull request, such as:
- **ID**: The unique ID of the pull request.
- **Title**: The title of the pull request.
- **Creator**: The user who created the pull request.
- **Creation Date**: When the pull request was created.
- **Status**: The current status (e.g., `completed`, `active`).
- **Reviewers**: The list of reviewers with their votes and feedback.
- **Source and Target Branches**: The branches involved in the pull request.

---

## **2. Get Pull Requests Based on Repository ID**

### **Endpoint**

GET https://{instance}/{collection}/_apis/git/repositories/{repositoryId}/pullrequests?api-version=4.1


### **Description**
Fetch all pull requests associated with a specific repository.

### **Parameters**
- `{instance}`: The base URL of the Azure DevOps instance.
- `{collection}`: The collection name.
- `{repositoryId}`: The unique ID of the repository.

### **Example**

GET https://tfs.pacific.costcotravel.com/tfs/TestAutomation/_apis/git/repositories/fa36faa9-5026-46b8-84eb-561117e8f4fe/pullrequests?api-version=4.1


### **Response**
The response contains a list of pull requests with details such as:
- **Pull Request ID**: Unique identifier.
- **Title**: Pull request title.
- **Creator**: The user who created the pull request.
- **Status**: Current status (`completed`, `active`, etc.).
- **Reviewers**: Assigned reviewers.
- **Creation Date**: Date the pull request was created.

---

## **3. Get Repositories**

### **QA Environment**

GET https://tfs.pacific.costcotravel.com/tfs/TestAutomation/_apis/git/repositories?api-version=1.0


### **DEV Environment**

GET https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/git/repositories?api-version=1.0


### **Description**
Retrieve all repositories within the specified collection for either QA or DEV environments.

### **Response**
The response includes:
- **Repository Name**: Human-readable name of the repository.
- **Repository ID**: Unique identifier.
- **URL**: URL of the repository.
- **Default Branch**: The default branch of the repository.
- **Project Information**: Details of the associated project.

---

## **4. Get Teams**

### **Endpoint**

GET https://{instance}/{collection}/_apis/teams?api-version=4.1-preview.2


### **Description**
Fetches all teams associated with the specified collection.

### **Parameters**
- `{instance}`: The base URL of the Azure DevOps instance.
- `{collection}`: The collection name.

### **Example**

GET https://tfs.pacific.costcotravel.com/tfs/TestAutomation/_apis/teams?api-version=4.1-preview.2


### **Response**
The response contains:
- **Team Name**: The name of each team.
- **Team ID**: Unique identifier for each team.
- **Description**: A brief description of the team.
- **Project ID**: The project the team is associated with.

### **4a. Get Team Members: 

GET https://{instance}/{collection}/_apis/projects/{projectId}/teams/{teamId}/members?api-version=4.1
https://tfs.pacific.costcotravel.com/tfs/TestAutomation/_apis/projects/baac0adf-5cc1-40ae-a92f-c9adc45fd198/teams/5191c4ff-b34e-414d-9ef5-ee26cc01ffe2/members?api-version=4.1


---

## **5. Get Commits**

### **Endpoint**

GET https://{instance}/{collection}/{project}/_apis/git/repositories/{repositoryId}/commits?api-version=4.1


### **Description**
Fetch a list of commits for a specified repository.

### **Parameters**
- `{instance}`: The base URL of the Azure DevOps instance.
- `{collection}`: The collection name.
- `{project}`: The project name or ID.
- `{repositoryId}`: The unique ID of the repository.

### **Example**

GET https://tfs.pacific.costcotravel.com/tfs/TestAutomation/baac0adf-5cc1-40ae-a92f-c9adc45fd198/_apis/git/repositories/baac0adf-5cc1-40ae-a92f-c9adc45fd198/commits?api-version=4.1


### **Response**
The response includes:
- **Commit ID**: Unique identifier of the commit.
- **Author**: Details about the commit author (name, email, date).
- **Committer**: Details about the committer (name, email, date).
- **Comment**: Commit message.
- **Change Count**: Number of files changed in the commit.

---

## **Usage Notes**

1. **Authentication**
   - All endpoints require proper authentication. Use a personal access token (PAT) or basic authentication.
   - Include the `Authorization` header with `Basic {base64_encoded_pat}`.

2. **Error Handling**
   - Responses may include error codes:
     - **400**: Bad request (e.g., missing parameters).
     - **401**: Unauthorized (e.g., invalid or missing authentication).
     - **404**: Not found (e.g., invalid IDs or endpoints).

3. **Query Parameters**
   - Use query parameters to filter responses (e.g., by date range, branch, or status).

---

## **References**

- [Azure DevOps REST API Documentation](https://learn.microsoft.com/en-us/rest/api/azure/devops/)
- [API Versioning](https://learn.microsoft.com/en-us/rest/api/azure/devops/?view=azure-devops-rest-7.1)

This guide is tailored for Azure DevOps workflows within the QA and DEV environments of Costco Travel. Adjust examples and parameters as needed for other environments or use cases.
