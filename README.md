This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Example Structure

```bash
QAMetricMonitor/
├── config/                       # Configuration files
│   ├── dbConfig.js               # Database configuration
│   └── env.js                    # Environment variables management
├── dashboards/                   # Grafana dashboard-related JSON files
│   ├── barChart.json             # Bar chart dashboard JSON
│   ├── qualityMetrics.json       # Quality assurance metrics dashboard JSON
│   ├── timeseries.json           # Timeseries dashboard JSON
│   └── trendData.json            # Timeseries with success rate & trend JSON
├── data/                         # Data handling
│   ├── createTable.sql           # SQL table creation script
│   └── testConnection.js         # Database connection test
├── services/                     # Core services (logic)
│   ├── crtJenkinsTrendService.js # Logic for Jenkins trend data
│   ├── tfsAutomationService.js   # Automation-related TFS logic
│   ├── tfsBugService.js          # Bug-related data logic
│   ├── tfsFeatureService.js      # Feature-related data logic
│   └── index.js                  # Service entry point
├── api/                          # API layer (if required)
│   ├── jenkinsApi.js             # Jenkins API integrations
│   └── tfsApi.js                 # TFS API integrations
├── utils/                        # Helper utilities
│   ├── logger.js                 # Logging utilities
│   ├── constants.js              # Shared constants
│   └── helpers.js                # Shared helper functions
├── tests/                        # Automated tests
│   ├── integration/              # Integration tests
│   │   ├── dbTests.js            # Database integration tests
│   │   └── apiTests.js           # API integration tests
│   └── unit/                     # Unit tests
│       ├── crtJenkinsTrend.test.js
│       ├── tfsAutomation.test.js
│       └── tfsFeature.test.js
├── main.js                       # Entry point for the application
├── package.json                  # NPM package configuration
├── README.md                     # Project documentation
└── .env                          # Environment variables (gitignored)
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
#   Q A M e t r i c M o n i t o r  
 #   Q A M e t r i c M o n i t o r  
 