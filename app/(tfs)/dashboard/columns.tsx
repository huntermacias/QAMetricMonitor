"use client"

import { ColumnDef } from "@tanstack/react-table"

export type SDETTable = {
  id: string
  status: "in progress" | "completed" | "up next" | "failed"
  sdet: string
  team: string
  testability: number
  environment: number
  production: number
  existing: number
  testType: "API/Service" | "UI"
  date: string
  failedFirstRun: number
  failedLastRun: number
  lastRunId: number
  percentPassing: number
}

export const columns: ColumnDef<SDETTable>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const val = row.getValue("status") as SDETTable["status"]
      return <span className="capitalize">{val.replace("-", " ")}</span>
    },
  },
  {
    accessorKey: "sdet",
    header: "SDET",
  },
  {
    accessorKey: "team",
    header: "Team",
  },
  {
    accessorKey: "testType",
    header: "Test Type",
    cell: ({ row }) => {
      const val = row.getValue("testType") as SDETTable["testType"]
      return <span>{val}</span>
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const dateVal = row.getValue("date") as string
      const formatted = new Date(dateVal).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      return <div className="text-left">{formatted}</div>
    },
  },
  {
    accessorKey: "testability",
    header: "Testability Bugs",
    cell: ({ row }) => {
      const val = row.getValue("testability") as number
      return <div className="text-center mr-8">{val}</div>
    },
  },
  {
    accessorKey: "environment",
    header: "Env Bugs",
    cell: ({ row }) => {
      const val = row.getValue("environment") as number
      return <div className="text-center mr-8">{val}</div>
    },
  },
  {
    accessorKey: "production",
    header: "Prod Bugs",
    cell: ({ row }) => {
      const val = row.getValue("production") as number
      return <div className="text-center mr-8">{val}</div>
    },
  },
  {
    accessorKey: "existing",
    header: "Existing Bugs",
    cell: ({ row }) => {
      const val = row.getValue("existing") as number
      return <div className="text-center mr-8">{val}</div>
    },
  },
  {
    accessorKey: "failedFirstRun",
    header: "Failed (1st Run)",
    cell: ({ row }) => {
      const val = row.getValue("failedFirstRun") as number
      return <div className="text-center mr-8">{val}</div>
    },
  },
  {
    accessorKey: "failedLastRun",
    header: "Failed (Last Run)",
    cell: ({ row }) => {
      const val = row.getValue("failedLastRun") as number
      return <div className="text-center mr-8">{val}</div>
    },
  },
  {
    accessorKey: "lastRunId",
    header: "Last Run ID",
    cell: ({ row }) => {
      const val = row.getValue("lastRunId") as number
      return <div className="text-center mr-8">{val}</div>
    },
  },
  {
    accessorKey: "percentPassing",
    header: "Passing %",
    cell: ({ row }) => {
      const val = row.getValue("percentPassing") as number
      return <div className="text-left ml-1">{val.toFixed(2)}%</div>
    },
  },
]
