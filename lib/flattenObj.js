function flattenObject(obj, prefix = "") {
    const flattened = {};
  
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
  
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          // Recursively flatten for nested objects
          Object.assign(flattened, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          // Handle arrays by indexing keys
          value.forEach((item, index) => {
            Object.assign(flattened, flattenObject(item, `${newKey}[${index}]`));
          });
        } else {
          // Directly assign primitive values
          flattened[newKey] = value;
        }
      }
    }
  
    return flattened;
  }
  
  // Example usage
  const exampleData = {
    "id": 619249,
    "rev": 23,
    "fields": {
      "System.AreaPath": "Work Items\\Member Journey\\Shopping\\Shopping\\Search-Customize (Member)",
      "System.TeamProject": "Work Items",
      "System.IterationPath": "Work Items\\FY25\\FY25_P05\\FY25_P05_Sprint01",
      "System.WorkItemType": "Bug",
      "System.State": "Committed",
      "System.Reason": "Commitment made by the team",
      "System.AssignedTo": "Eric Esteban \u003CPACIFIC\\eric.esteban\u003E",
      "System.CreatedDate": "2024-12-06T23:24:07.62Z",
      "System.CreatedBy": "Varghese Varampinakathu \u003CPACIFIC\\v.varampinakathu\u003E",
      "System.ChangedDate": "2024-12-23T19:06:36.213Z",
      "System.ChangedBy": "Peter Yan \u003CPACIFIC\\peter.yan\u003E",
      "System.Title": "[Perf] Load Theme Park - Increase In Response time by ~1s - 55x calls to getCommunicationRemarks-\u003ESP_CWCTravel_Get_Communication_Remarks_S ",
      "System.BoardColumn": "Committed",
      "System.BoardColumnDone": false,
      "Microsoft.VSTS.Common.Priority": 3,
      "CostcoTravel.ResourceQA": "Peter Yan \u003CPACIFIC\\peter.yan\u003E",
      "CostcoTravel.Environment": "[QAPerf]",
      "Microsoft.VSTS.Common.Severity": "3 - Medium",
      "Microsoft.VSTS.Common.BacklogPriority": 1260854938,
      "Microsoft.VSTS.CMMI.Blocked": "No",
      "Microsoft.VSTS.Scheduling.Effort": 2,
      "WEF_B5C358B7D5C24E9DAC233C93B2625675_Kanban.Column": "Committed",
      "WEF_0B595633FD7C4775860E929290B0647B_Kanban.Column": "Backlog(New)",
      "WEF_0B595633FD7C4775860E929290B0647B_Kanban.Column.Done": false,
      "WEF_B5C358B7D5C24E9DAC233C93B2625675_Kanban.Column.Done": false,
      "CostcoTravel.CostOfDelay": 1,
      "CostcoTravel.WSJF": 0,
      "WEF_6E35FD5BE74648CB8718B488BFB4DDAB_Kanban.Column": "Accepted",
      "WEF_6E35FD5BE74648CB8718B488BFB4DDAB_Kanban.Column.Done": false,
      "CostcoTravel.Team": "Shopping Team 01",
      "CostcoTravel.Iteration": "No Errors",
      "WEF_7312F901F6D14BB680AB763453E511F2_Kanban.Column": "Committed",
      "WEF_7312F901F6D14BB680AB763453E511F2_Kanban.Column.Done": false,
      "CostcoTravel.Area": "No Errors",
      "System.Description": "\u003Cimg src=\"https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/e8919900-3758-4a80-9a38-4391f5210aca/_apis/wit/attachments?FileNameGuid=a7284606-b9d4-4482-a592-293b04a294ff&amp;FileName=temp1733527293385.png\" style=\"width:462px;\"\u003E\u003Cbr\u003E\u003Cbr\u003E\u003Cdiv\u003ELatest trace shows more than 55 calls to&nbsp;\u003Cspan style=\"color:rgb(0, 98, 122);font-family:&quot;JetBrains Mono&quot;, monospace;font-size:11.3pt;\"\u003EgetCommunicationRemarks()-&gt;\u003C/span\u003E\u003Cspan style=\"padding:0px 0px 0px 2px;\"\u003E\u003Cspan style=\"color:rgb(0, 0, 0);font-family:Consolas;font-size:12pt;white-space:pre;\"\u003E\u003Cspan style=\"color:#2a00ff;\"\u003ESP_CWCTravel_\u003C/span\u003E\u003Cspan style=\"color:#2a00ff;background-color:#ceccf7;\"\u003EGet_Communication_Remarks\u003C/span\u003E\u003Cspan style=\"color:#2a00ff;\"\u003E_S\u003C/span\u003E\u003C/span\u003E\u003C/span\u003E&nbsp;and queryRatesOfTicketProduct, which didn't exist in previous release.\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003ED04.02:https://pok523.dynatrace-managed.com/e/007b32db-9908-4111-bb61-1b68654d28f5/#trace;gtf=c_1733467358055_1733467966217;gf=all;traceId=ff0e33fb1e850d0356574c6b42e07207;timeframe=custom1733467783657to1733467904411;callURI=10419085Z1X11X0X5903217X20241205224829Y0Y0.session\u003C/div\u003E\u003Cdiv\u003E\u003Cimg src=\"https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/e8919900-3758-4a80-9a38-4391f5210aca/_apis/wit/attachments?FileNameGuid=4cf0ff5e-4743-4a4f-838a-044f7f5ab927&amp;FileName=temp1733527351853.png\" style=\"width:503.2px;\"\u003E\u003Cbr\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003ED03.02: https://pok523.dynatrace-managed.com/e/007b32db-9908-4111-bb61-1b68654d28f5/#trace;gtf=c_1732259006899_1732259565678;gf=all;traceId=b4d9c7e2625b3767f19750ecf46c0915;timeframe=custom1732259037470to1732259157939;callURI=88764266Z1X13X0X16591442X20241121225311Y0Y0.session\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cimg src=\"https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/e8919900-3758-4a80-9a38-4391f5210aca/_apis/wit/attachments?FileNameGuid=17da7045-5c44-4f1d-8240-332dacbbf5cb&amp;FileName=temp1733527405685.png\" style=\"width:503.2px;\"\u003E\u003Cbr\u003E&nbsp;\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E",
      "Microsoft.VSTS.TCM.ReproSteps": "env:&nbsp;https://consumer.perf.qa.costcotravel.com/\u003Cdiv\u003ESteps:\u003C/div\u003E\u003Cdiv\u003ESearch for VP package without flight for destination Orlando\u003C/div\u003E\u003Cdiv\u003ENavigate and load theme park page\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003EExpected:\u003C/div\u003E\u003Cdiv\u003EResponse time under 550ms\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003EActual\u003C/div\u003E\u003Cdiv\u003EResponse time of ~1s\u003C/div\u003E",
      "System.Tags": "#Perf; LowerEnv"
    },
    "_links": {
      "self": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/619249"
      },
      "workItemUpdates": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/619249/updates"
      },
      "workItemRevisions": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/619249/revisions"
      },
      "workItemHistory": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/619249/history"
      },
      "html": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/web/wi.aspx?pcguid=c39774a5-4474-49df-ba53-807e6a86def1&id=619249"
      },
      "workItemType": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/e8919900-3758-4a80-9a38-4391f5210aca/_apis/wit/workItemTypes/Bug"
      },
      "fields": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/fields"
      }
    },
    "url": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/619249"
  }
  
  const flattenedData = flattenObject(exampleData);
  console.log(flattenedData);
  