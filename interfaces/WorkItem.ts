// interfaces/WorkItem.ts

import { SystemFields } from './SystemFields';
import { MicrosoftVSTSCommonFields } from './MicrosoftVSTSCommonFields';
import { MicrosoftVSTSCMMIFields } from './MicrosoftVSTSCMMIFields';
import { MicrosoftVSTSCommonSchedulingFields } from './MicrosoftVSTSCommonSchedulingFields';
import { CostcoTravelFields } from './CostcoTravelFields';
import { WEFFields } from './WEFFields';

export interface WorkItem {
  id: number;
  url: string;
  system: SystemFields;
  microsoftVSTSCommon: MicrosoftVSTSCommonFields;
  microsoftVSTSCMMI: MicrosoftVSTSCMMIFields;
  microsoftVSTSCommonScheduling: MicrosoftVSTSCommonSchedulingFields;
  costcoTravel: CostcoTravelFields;
  wef: WEFFields[];
  systemDescription: string;
}
