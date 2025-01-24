export const config = {
    UI_BASE_URL: process.env.JENKINS_BASE_URL_UI || "https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/00%20-%20Weekly%20UI%20CRT",
    API_BASE_URL: process.env.JENKINS_BASE_URL_API || "https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/00%20-%20Weekly%20Service%20API%20CRT",
    TOKEN: process.env.JENKINS_AUTH_TOKEN || "TOKEN_GOES_HERE",
    jobList : [
        "00_Shopping_UI_CRT_Agent_Tests",
        "01_Shopping_UI_CRT_Consumer_Part1",
        "02_Shopping_UI_CRT_Consumer_Part2",
        "03_Shopping_UI_CRT_Consumer_Part3",
        "03_Shopping_API_Service_Hotel_Search",
        "00_Shopping_API_APIConnect_Cruise",
        "00_Shopping_API_Service_Odysseus_Cruise",
        "01_Shopping_API_Service_Derby_Tickets",
      ]
  };

