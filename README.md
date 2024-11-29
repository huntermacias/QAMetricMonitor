Features
- Interactive Dashboards: Visualize bug counts, severity distributions, and trends over time.
- Detailed Work Item Views: Access in-depth information about each work item, including descriptions and custom fields.
- Advanced Metrics: Monitor QA performance metrics like bug resolution time, reopened bug rates, and test case execution status.
- Filtering and Sorting: Easily filter and sort work items based on state, type, assigned user, and team.
- Modern Design: A fresh, techy, and developer-first design with a theme that aligns with Costco Travel branding.

## Project Structure
```md
QAMetricMonitor/
├── app/
│   ├── api/
│   │   ├── bug-resolution-time/
│   │   │   └── route.ts
│   │   ├── bug-severity-priority/
│   │   │   └── route.ts
│   │   ├── bug-trends/
│   │   │   └── route.ts
│   │   ├── bugs-per-feature/
│   │   │   └── route.ts
│   │   ├── code-coverage/
│   │   │   └── route.ts
│   │   ├── qa-performance/
│   │   │   └── route.ts
│   │   ├── reopened-bugs-rate/
│   │   │   └── route.ts
│   │   ├── test-case-status/
│   │   │   └── route.ts
│   │   └── tfs/
│   │       └── route.ts
│   └── tfs/
│       └── page.tsx
├── components/
│   ├── Modal.tsx
│   └── /* Other reusable components */
├── interfaces/
│   ├── CostcoTravelFields.ts
│   ├── MicrosoftVSTSCMMIFields.ts
│   ├── MicrosoftVSTSCommonFields.ts
│   ├── MicrosoftVSTSCommonSchedulingFields.ts
│   ├── SystemFields.ts
│   └── WorkItem.ts
├── public/
│   └── /* Static assets */
├── styles/
│   └── /* Global and component-specific styles */
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── README.md
└── tsconfig.json
```
