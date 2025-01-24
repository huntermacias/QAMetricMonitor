// Interfaces
export interface JenkinsJob {
  name: string;
  url: string;
  color: string;
}

export interface JenkinsResponse {
  description: string | null;
  jobs: JenkinsJob[];
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

export interface ProcessedBuildData extends BuildData {
  commits?: ChangeSetItem[];
  culprits?: string[];
  artifacts?: Artifact[];
  parameters?: Record<string, string | boolean | number>;
  cause?: {
    shortDescription?: string;
    upstreamProject?: string;
    upstreamBuild?: number;
    userName?: string | null;
  };
  timeInQueue?: {
    blockedDurationMillis: number;
    buildableDurationMillis: number;
    waitingDurationMillis: number;
    executingTimeMillis: number;
  };
}

export interface Cause {
    _class: string;
    shortDescription?: string;
    userName?: string;
    userId?: string;
    upstreamBuild?: number;
    upstreamProject?: string;
    upstreamUrl?: string;
  }
  
  export interface Parameter {
    _class: string;
    name: string;
    value: string | boolean | number;
  }
  
  export interface Artifact {
    displayPath: string;
    fileName: string;
    relativePath: string;
  }
  
  export interface Culprit {
    absoluteUrl: string;
    fullName: string;
  }
  
  export interface ChangeSetPath {
    editType: string;
    file: string;
  }
  
  export interface ChangeSetItem {
    _class: string;
    commitId: string;
    timestamp: number;
    authorEmail: string;
    comment: string;
    date: string;
    id: string;
    msg: string;
    author: {
      absoluteUrl?: string;
      fullName?: string;
    };
    paths: ChangeSetPath[];
  }
  
  export interface ChangeSetList {
    _class: string;
    items: ChangeSetItem[];
    kind: string;
  }
  
  export interface Action {
    _class: string;
    causes?: Cause[];
    parameters?: Parameter[];
    failCount?: number;
    skipCount?: number;
    totalCount?: number;
    blockedDurationMillis?: number;
    buildableDurationMillis?: number;
    waitingDurationMillis?: number;
    executingTimeMillis?: number;
  }
  
  export interface BuildDataRaw {
    _class: string;
    actions: Action[];
    artifacts: Artifact[];
    building: boolean;
    description: string | null;
    displayName: string;
    duration: number;
    estimatedDuration: number;
    executor: string | null;
    fullDisplayName: string;
    id: string;
    inProgress: boolean;
    keepLog: boolean;
    number: number;
    queueId: number;
    result: string | null;
    timestamp: number;
    url: string;
    builtOn: string;
    changeSet: ChangeSetList;
    culprits: Culprit[];
  }