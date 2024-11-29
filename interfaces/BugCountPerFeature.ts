// interfaces/BugCountPerFeature.ts

// export interface BugCountPerFeature {
//     featureId: number;
//     featureTitle: string;
//     bugCount: number;
//   }
  
export interface FeatureBugCount {
    featureId: number;
    featureTitle: string;
    openBugCount: number;
    closedBugCount: number;
  }
  