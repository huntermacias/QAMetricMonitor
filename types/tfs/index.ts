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


  // Types used for Jenkins related stuff
  export interface RelatedBug {
    id: number;
    title: string;
    state: string;
    url: string;
    // Add other relevant fields as needed
  }
  
  export interface BuildData {
    jobName?: string;
    fullDisplayName: string;
    trimmedDisplayName: string;
    timestamp: number;
    number: number;
    userName: string | null;
    duration: number;
    estimatedDuration: number;
    result: string;  // e.g. "SUCCESS", "FAILED", "UNKNOWN", etc.
    failCount: number;
    totalCount: number;
    skipCount: number;
    failedTests: string[];
    baselineFound?: boolean;
    calculatedPassCount?: number;
    teams: number[];
    relatedBugs?: RelatedBug[];
  }