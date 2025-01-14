// interfaces/SystemFields.ts

export interface SystemFields {
    Id: number;
    AreaId: number;
    AreaPath: string;
    TeamProject: string;
    NodeName: string;
    AreaLevel1: string;
    AreaLevel2: string;
    AreaLevel3: string;
    AreaLevel4: string;
    Rev: number;
    AuthorizedDate: string; // ISO date string
    RevisedDate: string; // ISO date string
    IterationId: number;
    IterationPath: string;
    IterationLevel1: string;
    IterationLevel2: string;
    IterationLevel3: string;
    IterationLevel4: string;
    WorkItemType: string;
    State: string;
    Reason: string;
    AssignedTo: string;
    CreatedDate: string; // ISO date string
    CreatedBy: string;
    ChangedDate: string; // ISO date string
    ChangedBy: string;
    AuthorizedAs: string;
    PersonId: number;
    Title: string;
    BoardColumn: string;
    BoardColumnDone: boolean;
    tags: any;
    relations: any;
  }
  