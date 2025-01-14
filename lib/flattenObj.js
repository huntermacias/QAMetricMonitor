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
    "id": 608085,
    "rev": 27,
    "fields": {
      "System.Id": 608085,
      "System.AreaId": 2227,
      "System.AreaPath": "Work Items\\Member Journey\\Shopping\\Shopping\\Search-Customize (Member)",
      "System.TeamProject": "Work Items",
      "System.NodeName": "Search-Customize (Member)",
      "System.AreaLevel1": "Work Items",
      "System.AreaLevel2": "Member Journey",
      "System.AreaLevel3": "Shopping",
      "System.AreaLevel4": "Shopping",
      "System.AreaLevel5": "Search-Customize (Member)",
      "System.Rev": 27,
      "System.AuthorizedDate": "2025-01-06T21:57:53.857Z",
      "System.RevisedDate": "9999-01-01T00:00:00Z",
      "System.IterationId": 2474,
      "System.IterationPath": "Work Items\\FY25\\FY25_P05\\FY25_P05_Sprint02",
      "System.IterationLevel1": "Work Items",
      "System.IterationLevel2": "FY25",
      "System.IterationLevel3": "FY25_P05",
      "System.IterationLevel4": "FY25_P05_Sprint02",
      "System.WorkItemType": "User Story",
      "System.State": "Committed",
      "System.Reason": "Commitment made by the team",
      "System.AssignedTo": "Eric Esteban \u003CPACIFIC\\eric.esteban\u003E",
      "System.CreatedDate": "2024-10-30T18:19:11.617Z",
      "System.CreatedBy": "Eric Esteban \u003CPACIFIC\\eric.esteban\u003E",
      "System.ChangedDate": "2025-01-06T21:57:53.857Z",
      "System.ChangedBy": "Karthik Srinivas Palladagu \u003CPACIFIC\\c_k.srinivaspalladag\u003E",
      "System.AuthorizedAs": "Karthik Srinivas Palladagu \u003CPACIFIC\\c_k.srinivaspalladag\u003E",
      "System.PersonId": 21965,
      "System.Watermark": 4789653,
      "System.Title": "Theme Parks page: [Epic] update layout 'Ticket Options' cards",
      "System.BoardColumn": "In Progress",
      "System.BoardColumnDone": false,
      "CostcoTravel.ResourceQA": "Hunter Macias \u003CPACIFIC\\hunter.rocha\u003E",
      "Microsoft.VSTS.Common.BacklogPriority": 1368524669,
      "Microsoft.VSTS.CMMI.Blocked": "Yes",
      "Microsoft.VSTS.Scheduling.Effort": 1,
      "WEF_B5C358B7D5C24E9DAC233C93B2625675_System.ExtensionMarker": true,
      "WEF_B5C358B7D5C24E9DAC233C93B2625675_Kanban.Column": "In Progress",
      "WEF_B5C358B7D5C24E9DAC233C93B2625675_Kanban.Column.Done": false,
      "CostcoTravel.CostOfDelay": 1,
      "CostcoTravel.WSJF": 0,
      "CostcoTravel.Team": "Shopping Team 01",
      "CostcoTravel.Iteration": "No Errors",
      "CostcoTravel.QAConfiguration": "No",
      "WEF_7312F901F6D14BB680AB763453E511F2_System.ExtensionMarker": true,
      "WEF_7312F901F6D14BB680AB763453E511F2_Kanban.Column": "Committed",
      "WEF_7312F901F6D14BB680AB763453E511F2_Kanban.Column.Done": false,
      "CostcoTravel.Area": "No Errors",
      "WEF_EFD4DBC451C347F89611BF2B351D5F1E_System.ExtensionMarker": true,
      "WEF_EFD4DBC451C347F89611BF2B351D5F1E_Kanban.Column": "Committed",
      "WEF_EFD4DBC451C347F89611BF2B351D5F1E_Kanban.Column.Done": false,
      "System.Description": "\u003Cdiv\u003E\u003Cdiv\u003E\u003Cdiv\u003E\u003Cspan style=\"font-weight:bold;\"\u003EPurpose:\u003C/span\u003E&nbsp;to update layout for 'Ticket Options' cards to highlight Epic theme park, so that members are aware that tickets with Epic option are special.&nbsp;&nbsp;\u003C/div\u003E\u003Cdiv\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cspan style=\"font-weight:bold;\"\u003ENotes:\u003C/span\u003E\u003C/div\u003E\u003Cdiv\u003E- The grand opening for Epic theme park is May 22, 2025\u003C/div\u003E\u003Cdiv\u003E- This story is for adding the Epic icon, green box, and text to 'Ticket Options' card on Theme Parks page.&nbsp;\u003C/div\u003E\u003Cdiv\u003E\u003Cdiv\u003E-&nbsp;\u003Ca href=\"https://www.figma.com/design/H13ozjQgxfHS7kWT4QliWN/Theme-Park-Hand-off-file?node-id=343-8774&amp;t=svMQZIu0BjPYd1WF-1\" aria-label=\"CTRL+Click or CTRL+Enter to follow link https://www.figma.com/design/H13ozjQgxfHS7kWT4QliWN/Theme-Park-Hand-off-file?node-id=343-8774&amp;t=svMQZIu0BjPYd1WF-1\"\u003EFigma Link (Final Design)\u003C/a\u003E\u003C/div\u003E\u003Cdiv\u003E-&nbsp;\u003Ca aria-label=\"Link Figma Link (Final Presentation)\" href=\"https://www.figma.com/design/H13ozjQgxfHS7kWT4QliWN/Theme-Park-Hand-off-file?node-id=1-696&amp;t=nYmN61YIhzxhNXKX-1\" rel=\"noreferrer noopener\" target=_blank class=\"fui-Link ___1rxvrpe f2hkw1w f3rmtva f1ewtqcl fyind8e f1k6fduh f1w7gpdv fk6fouc fjoy568 figsok6 f1hu3pq6 f11qmguv f19f4twv f1tyq0we f1g0x7ka fhxju0i f1qch9an f1cnd47f fqv5qza f1vmzxwi f1o700av f13mvf36 f1cmlufx f9n3di6 f1ids18y f1tx3yz7 f1deo86v f1eh06m1 f1iescvh fhgqx19 f1olyrje f1p93eir f1nev41a f1h8hb77 f1lqvz6u f10aw75t fsle3fq f17ae5zn\" title=\"https://www.figma.com/design/h13ozjqgxfhs7kwt4qliwn/theme-park-hand-off-file?node-id=1-696&amp;t=nymn61yihzxhnxkx-1\"\u003EFigma Link (Final Presentation)\u003C/a\u003E&nbsp;\u003C/div\u003E\u003Cdiv\u003E-&nbsp;\u003Ca aria-label=\"Link Prototype Link (Desktop)\" href=\"https://www.figma.com/proto/H13ozjQgxfHS7kWT4QliWN/Theme-Park-Hand-off-file?page-id=1:4&amp;node-id=124-19124&amp;viewport=555%2c594%2c0.05&amp;t=vkFxRYXOkIIZb2nt-1&amp;scaling=min-zoom&amp;starting-point-node-id=124:19124&amp;show-proto-sidebar=1\" rel=\"noreferrer noopener\" target=_blank class=\"fui-Link ___1rxvrpe f2hkw1w f3rmtva f1ewtqcl fyind8e f1k6fduh f1w7gpdv fk6fouc fjoy568 figsok6 f1hu3pq6 f11qmguv f19f4twv f1tyq0we f1g0x7ka fhxju0i f1qch9an f1cnd47f fqv5qza f1vmzxwi f1o700av f13mvf36 f1cmlufx f9n3di6 f1ids18y f1tx3yz7 f1deo86v f1eh06m1 f1iescvh fhgqx19 f1olyrje f1p93eir f1nev41a f1h8hb77 f1lqvz6u f10aw75t fsle3fq f17ae5zn\" title=\"https://www.figma.com/proto/h13ozjqgxfhs7kwt4qliwn/theme-park-hand-off-file?page-id=1%3a4&amp;node-id=124-19124&amp;viewport=555%2c594%2c0.05&amp;t=vkfxryxokiizb2nt-1&amp;scaling=min-zoom&amp;starting-point-node-id=124%3a19124&amp;show-proto-sidebar=1\"\u003EPrototype Link (Desktop)\u003C/a\u003E&nbsp;\u003C/div\u003E\u003C/div\u003E\u003C/div\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003C/div\u003E\u003Cdiv\u003EExample desktop:\u003C/div\u003E\u003Cdiv\u003E\u003Cimg src=\"https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/e8919900-3758-4a80-9a38-4391f5210aca/_apis/wit/attachments?FileNameGuid=7ccd3830-bd0d-46bb-8ebc-fdb96324146d&amp;FileName=temp1730312339225.png\" style=\"width:608.6px;\"\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cimg src=\"https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/e8919900-3758-4a80-9a38-4391f5210aca/_apis/wit/attachments?FileNameGuid=b25fd8c6-ec09-4c5c-a02f-330c0c35536d&amp;FileName=temp1730312349780.png\" style=\"width:608.6px;\"\u003E\u003Cbr\u003E&nbsp;\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E&nbsp;\u003Cbr\u003E\u003C/div\u003E",
      "Microsoft.VSTS.Common.AcceptanceCriteria": "\u003Cdiv\u003EBrowsers: Edge, Chrome, Safari\u003C/div\u003E\u003Cdiv\u003E\u003Cdiv\u003EApp: Consumer\u003C/div\u003E\u003Cdiv\u003EDevice: desktop, mobile\u003C/div\u003E\u003Cdiv\u003EDomain: USA, CAN&nbsp;\u003C/div\u003E\u003Cdiv\u003EProduct: VP single city&nbsp;&nbsp;\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cdiv\u003E\u003Cdiv\u003EScenarios:\u003C/div\u003E\u003Cdiv\u003Ewhen member navigates to Theme Parks page in VP shopping flow, and&nbsp;\u003C/div\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E1. when&nbsp;\u003Cspan style=\"font-family:&quot;Segoe UI&quot;, sans-serif;\"\u003ECONSUMER_CUSTOMIZE_VP_THEME_PARK_TICKETS_EPIC\u003C/span\u003E=true,&nbsp;&nbsp;\u003C/blockquote\u003E\u003C/div\u003E\u003C/div\u003E\u003C/div\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003Cdiv\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003Eapp&nbsp;\u003Cspan style=\"text-decoration-line:underline;font-style:italic;\"\u003Edisplays\u003C/span\u003E&nbsp;updated layout for 'Ticket Options' cards per Figma,&nbsp;&nbsp;\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E1.1. desktop shows Epic logo and text &quot;+1 Day at Epic&quot; in same green box.\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/div\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E1.1.1. All park icons appear horizontally aligned.\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E1.1.2. Text in blue boxes and text in green box appear horizontally aligned.\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003Cdiv\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/div\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003EExample: (Note: Epic in text should&nbsp;\u003Cspan style=\"text-decoration-line:underline;font-style:italic;font-weight:bold;\"\u003Enot\u003C/span\u003E&nbsp;be all capital letters)\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E&nbsp;\u003Cimg src=\"https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/e8919900-3758-4a80-9a38-4391f5210aca/_apis/wit/attachments?FileNameGuid=d4e430ad-1801-4bd5-8bf0-fb146d9d6a49&amp;FileName=temp1731287101508.png\" style=\"width:483px;\"\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E&nbsp;\u003Cbr\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003Cdiv\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E1.2. mobile shows logo in green box and text in separate green box.\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/div\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003EExample:\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E1.2.1. All park icons appear horizontally aligned.\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E1.2.2. Text in blue boxes horizontally aligned. Text in green box appears on its own line below row of blue boxes.\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003EExample: (Note: Epic in text should&nbsp;\u003Cspan style=\"text-decoration-line:underline;font-style:italic;font-weight:bold;\"\u003Enot\u003C/span\u003E&nbsp;be all capital letters)\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003Cdiv\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/div\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cimg src=\"https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/e8919900-3758-4a80-9a38-4391f5210aca/_apis/wit/attachments?FileNameGuid=30a42402-65b4-4122-aee7-f28b80657656&amp;FileName=temp1731287204170.png\" style=\"width:323px;\"\u003E\u003Cbr\u003E&nbsp;\u003Cbr\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E&nbsp;\u003Cbr\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003Cdiv\u003E\u003Cdiv\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E&nbsp;&nbsp;\u003C/blockquote\u003E\u003C/blockquote\u003E\u003Cdiv\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E2. when&nbsp;\u003Cspan style=\"font-family:&quot;Segoe UI&quot;, sans-serif;\"\u003ECONSUMER_CUSTOMIZE_VP_THEME_PARK_TICKETS_EPIC\u003C/span\u003E=false,&nbsp;&nbsp;\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003C/div\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003Eapp&nbsp;\u003Cspan style=\"text-decoration-line:underline;font-style:italic;\"\u003Edoes no\u003C/span\u003E\u003Cspan style=\"text-decoration-line:underline;font-style:italic;\"\u003Et\u003C/span\u003E&nbsp;app shows Epic icon normally with other theme park icons (no green boxes)\u003C/blockquote\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E&nbsp;&nbsp;\u003C/blockquote\u003E\u003C/blockquote\u003E\u003Cdiv\u003E\u003Cbr\u003E\u003C/div\u003E\u003C/div\u003E\u003C/div\u003E\u003Cdiv\u003E\u003Cdiv\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cblockquote style=\"margin:0px 0px 0px 40px;border:none;padding:0px;\"\u003E\u003Cbr\u003E\u003C/blockquote\u003E\u003C/blockquote\u003E\u003C/div\u003E\u003C/div\u003E"
    },
    "relations": [
      {
        "rel": "System.LinkTypes.Hierarchy-Forward",
        "url": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/624776",
        "attributes": {
          "isLocked": false
        }
      },
      {
        "rel": "Microsoft.VSTS.Common.TestedBy-Forward",
        "url": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/626067",
        "attributes": {
          "isLocked": false
        }
      },
      {
        "rel": "System.LinkTypes.Hierarchy-Forward",
        "url": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/625130",
        "attributes": {
          "isLocked": false
        }
      },
      {
        "rel": "System.LinkTypes.Dependency-Reverse",
        "url": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/626196",
        "attributes": {
          "isLocked": false
        }
      },
      {
        "rel": "System.LinkTypes.Hierarchy-Forward",
        "url": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/625129",
        "attributes": {
          "isLocked": false
        }
      },
      {
        "rel": "System.LinkTypes.Hierarchy-Reverse",
        "url": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/604765",
        "attributes": {
          "isLocked": false
        }
      }
    ],
    "_links": {
      "self": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/608085"
      },
      "workItemUpdates": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/608085/updates"
      },
      "workItemRevisions": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/608085/revisions"
      },
      "workItemHistory": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/608085/history"
      },
      "html": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/web/wi.aspx?pcguid=c39774a5-4474-49df-ba53-807e6a86def1&id=608085"
      },
      "workItemType": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/e8919900-3758-4a80-9a38-4391f5210aca/_apis/wit/workItemTypes/User%20Story"
      },
      "fields": {
        "href": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/fields"
      }
    },
    "url": "https://tfs.pacific.costcotravel.com/tfs/CostcoTravel/_apis/wit/workItems/608085"
  }
  const flattenedData = flattenObject(exampleData);
  console.log(flattenedData);
  