"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartConfig = {
  bugs: {
    label: "Total Bugs",
    color: "#1F77B4",
  },
  bugsOpened: {
    label: "New Bugs",
    color: "#2CA02C",
  },
  bugsClosed: {
    label: "Resolved Bugs",
    color: "#FF7F0E",
  },
} satisfies ChartConfig;

const regressionConfig = {
  passedTests: {
    label: "Passed Tests",
    color: "#00DFA2",
  },
  failedTests: {
    label: "Failed Tests",
    color: "#FF0000",
  },
} satisfies ChartConfig;

type ChartDataItem = {
  date: string;
  bugs: number;
  bugsOpened: number;
  bugsClosed: number;
};

type BugsOverTimeChartProps = {
  externalChartData?: ChartDataItem[];
  totalBugCount?: number;
};

export function BugsOverTimeChart({ externalChartData, totalBugCount }: BugsOverTimeChartProps) {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("bugs");
  const [timeRange, setTimeRange] = React.useState("90d");

  // If external data is provided, use it; otherwise, you can fallback to internally generated data.
  const chartData = React.useMemo(() => {
    if (externalChartData && externalChartData.length > 0) {
      return externalChartData;
    }
    // fallback scenario if needed: return an empty array or some mock data
    return [];
  }, [externalChartData]);

  // Summations
  const total = React.useMemo(() => {
    if (chartData.length === 0) {
      return {
        bugs: totalBugCount || 0,
        bugsOpened: 0,
        bugsClosed: 0,
      };
    }
    return {
      bugs: chartData.reduce((acc, curr) => acc + curr.bugs, 0),
      bugsOpened: chartData.reduce((acc, curr) => acc + curr.bugsOpened, 0),
      bugsClosed: chartData.reduce((acc, curr) => acc + curr.bugsClosed, 0),
    };
  }, [chartData, totalBugCount]);

  // mock data for regression tests
  const regressionData: {date: string; passedTests: number; failedTests: number;}[] = React.useMemo(() => {
    const startDate = new Date("2024-04-01");
    const endDate = new Date("2024-05-29");
    const data = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const passedTests = Math.floor(Math.random() * 500) + 400;
      const failedTests = Math.floor(Math.random() * 100);
      data.push({
        date: currentDate.toISOString().split("T")[0],
        passedTests,
        failedTests,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
  }, []);

  const filteredRegressionData = React.useMemo(() => {
    const referenceDate = new Date("2024-05-29");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return regressionData.filter((item) => new Date(item.date) >= startDate);
  }, [timeRange, regressionData]);

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl font-bold">Quality Assurance Metrics Dashboard</CardTitle>
          <CardDescription className="mt-2 text-sm">
            This dashboard provides an overview of ongoing bug activity, regression test results, 
            and quality trends over time.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Bug Tracking Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle className="text-xl font-semibold">Comprehensive Bug Tracking</CardTitle>
            <CardDescription className="text-sm">
              Explore total, newly opened, and resolved bugs over time. Click on a metric to focus on it.
            </CardDescription>
          </div>
          <div className="flex">
            {["bugs", "bugsOpened", "bugsClosed"].map((key) => {
              const chart = key as keyof typeof chartConfig;
              return (
                <button
                  key={chart}
                  data-active={activeChart === chart}
                  className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l hover:bg-muted/30 data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                  onClick={() => setActiveChart(chart)}
                >
                  <span className="text-xs text-muted-foreground">
                    {chartConfig[chart].label}
                  </span>
                  <span className="text-lg font-bold leading-none sm:text-3xl">
                    {total[chart].toLocaleString()}
                  </span>
                </button>
              )
            })}
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:p-6">
          <div className="mb-4 text-sm text-muted-foreground">
            Bar Chart View: Compare daily counts.
          </div>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={true} stroke="#212121" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                }
              />
              <Bar
                dataKey={activeChart}
                fill={chartConfig[activeChart].color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>

        <CardContent className="px-2 pt-4 sm:p-6">
          <div className="mb-4 text-sm text-muted-foreground">
            Line Chart View: Observe trends and patterns over time.
          </div>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={true} stroke="#212121" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={15}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                }
              />
              <Line
                dataKey={activeChart}
                type="monotone"
                stroke={chartConfig[activeChart].color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Regression Testing Trend Card */}
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle className="text-xl font-semibold">Regression Testing Trends</CardTitle>
            <CardDescription className="text-sm">
              View passing and failing tests over the selected timeframe.
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg sm:ml-auto"
              aria-label="Select a timeframe"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={regressionConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredRegressionData}>
              <defs>
                <linearGradient id="fillPassed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1e1e1e" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF0000" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1e1e1e" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={true} stroke="#212121" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="passedTests"
                type="natural"
                stroke="#4CAF50"
                fill="url(#fillPassed)"
                stackId="a"
              />
              <Area
                dataKey="failedTests"
                type="natural"
                stroke="#F44336"
                fill="#F44336"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
