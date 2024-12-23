// types/tfs/index.ts

export interface FeatureBugMetrics {
    featureId: number;
    featureTitle: string;
    openBugCount: number;
    closedBugCount: number;
    averageOpenBugAgeDays: number | null;
    averageClosedBugLifetimeDays: number | null;
  }
  
  export interface BugMetrics {
    openBugCount: number;
    closedBugCount: number;
    openBugDurationSum: number;
    openBugDurationCount: number;
    closedBugDurationSum: number;
    closedBugDurationCount: number;
  }
  
  export interface WorkItem {
    id: number;
    title: string;
    relations: any[];
  }


  export interface SprintDetail {
    id: number;
    workItemType: string;
    title: string;
    assignedTo: string;
    state: string;
    tags: string;
  }