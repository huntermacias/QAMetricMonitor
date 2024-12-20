"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

// Dummy data for all builds (list of all known Jenkins builds)
const allBuilds = [
  {
    jobName: "00_Shopping_UI_CRT_Agent_Tests",
    number: 101,
    fullDisplayName: "00_Shopping_UI_CRT_Agent_Tests #101",
    result: "SUCCESS",
    totalCount: 100,
    failCount: 0,
    skipCount: 0,
    duration: 250000
  },
  {
    jobName: "00_Shopping_UI_CRT_Agent_Tests",
    number: 102,
    fullDisplayName: "00_Shopping_UI_CRT_Agent_Tests #102",
    result: "FAILURE",
    totalCount: 100,
    failCount: 5,
    skipCount: 2,
    duration: 300000
  },
  {
    jobName: "00_Shopping_UI_CRT_Agent_Tests",
    number: 103,
    fullDisplayName: "00_Shopping_UI_CRT_Agent_Tests #103",
    result: "FAILURE",
    totalCount: 100,
    failCount: 3,
    skipCount: 1,
    duration: 320000
  },
  {
    jobName: "01_Shopping_UI_CRT_Consumer_Part1",
    number: 200,
    fullDisplayName: "01_Shopping_UI_CRT_Consumer_Part1 #200",
    result: "SUCCESS",
    totalCount: 120,
    failCount: 0,
    skipCount: 0,
    duration: 400000
  },
  {
    jobName: "01_Shopping_UI_CRT_Consumer_Part1",
    number: 201,
    fullDisplayName: "01_Shopping_UI_CRT_Consumer_Part1 #201",
    result: "FAILURE",
    totalCount: 120,
    failCount: 4,
    skipCount: 2,
    duration: 450000
  }
];

// Dummy data for build details and failed tests
const buildDetails:any = {
  "00_Shopping_UI_CRT_Agent_Tests#102": {
    failedTests: [
      {
        id: "test-1",
        testName: "Should login with valid credentials",
        filePath: "tests/ui/login.test.js",
        errorMessage: "Expected user to be logged in, but login button still visible.",
        screenshotUrl: "https://example.com/screenshot1.png"
      },
      {
        id: "test-2",
        testName: "Should add item to cart",
        filePath: "tests/ui/cart.test.js",
        errorMessage: "Item not found in cart after clicking add to cart.",
        screenshotUrl: "https://example.com/screenshot2.png"
      },
      {
        id: "test-3",
        testName: "Should apply discount code",
        filePath: "tests/ui/discount.test.js",
        errorMessage: "Discount not applied.",
        screenshotUrl: "https://example.com/screenshot3.png"
      },
      {
        id: "test-4",
        testName: "Should checkout successfully",
        filePath: "tests/ui/checkout.test.js",
        errorMessage: "Checkout button did not redirect to confirmation page.",
        screenshotUrl: "https://example.com/screenshot4.png"
      },
      {
        id: "test-5",
        testName: "Should display product details",
        filePath: "tests/ui/product-details.test.js",
        errorMessage: "Product details panel did not expand.",
        screenshotUrl: null
      }
    ]
  },
  "00_Shopping_UI_CRT_Agent_Tests#103": {
    failedTests: [
      {
        id: "test-6",
        testName: "Should filter products by category",
        filePath: "tests/ui/filter.test.js",
        errorMessage: "Filtered list is empty even though category has products.",
        screenshotUrl: "https://example.com/screenshot6.png"
      },
      {
        id: "test-7",
        testName: "Should show promotion banner",
        filePath: "tests/ui/promotion.test.js",
        errorMessage: "Promotion banner not visible on homepage.",
        screenshotUrl: null
      },
      {
        id: "test-8",
        testName: "Should remember user session",
        filePath: "tests/ui/session.test.js",
        errorMessage: "Session expired earlier than expected.",
        screenshotUrl: null
      }
    ]
  },
  "01_Shopping_UI_CRT_Consumer_Part1#201": {
    failedTests: [
      {
        id: "test-9",
        testName: "API returns correct product data",
        filePath: "tests/api/productApi.test.js",
        errorMessage: "Received 500 instead of 200.",
        screenshotUrl: null
      },
      {
        id: "test-10",
        testName: "User profile updates successfully",
        filePath: "tests/api/profile.test.js",
        errorMessage: "PUT /profile returned 404.",
        screenshotUrl: null
      },
      {
        id: "test-11",
        testName: "Should handle network errors gracefully",
        filePath: "tests/api/network.test.js",
        errorMessage: "UI did not display error message on network failure.",
        screenshotUrl: "https://example.com/screenshot11.png"
      },
      {
        id: "test-12",
        testName: "Should display search results",
        filePath: "tests/ui/search.test.js",
        errorMessage: "No results displayed for a known query.",
        screenshotUrl: "https://example.com/screenshot12.png"
      }
    ]
  }
};

// Types
interface Build {
  jobName: string;
  number: number;
  fullDisplayName: string;
  result: string;
  totalCount: number;
  failCount: number;
  skipCount: number;
  duration: number;
}

interface FailedTest {
  id: string;
  testName: string;
  filePath: string;
  errorMessage: string;
  screenshotUrl?: string | null;
}

interface BugFormData {
  title: string;
  assignedTo: string;
  area: string;
  iteration: string;
  reason: string;
  stepsToRepro: string;
  description: string;
  team: string;
  effort: string;
  qaResource: string;
  blocked: boolean;
  severity: string;
  priority: string;
  cause: string;
  relatedWork: string;
  application: string;
  environment: string;
  attachments: FileList | null;
}

export default function QAJenkinsPage() {
  const [selectedBuilds, setSelectedBuilds] = useState<string[]>([]); 
  const [buildData, setBuildData] = useState<(Build & {failedTests?: FailedTest[]})[]>([]);
  const [selectedFailedTest, setSelectedFailedTest] = useState<FailedTest | null>(null);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [bugForm, setBugForm] = useState<BugFormData>({
    title: "",
    assignedTo: "",
    area: "",
    iteration: "",
    reason: "",
    stepsToRepro: "",
    description: "",
    team: "",
    effort: "",
    qaResource: "",
    blocked: false,
    severity: "",
    priority: "",
    cause: "",
    relatedWork: "",
    application: "",
    environment: "",
    attachments: null,
  });

  // When selectedBuilds changes, we "fetch" their data (from our dummy data)
  useEffect(() => {
    const selectedData = selectedBuilds.map(bKey => {
      // bKey is something like "jobName#number"
      const [jobName, numStr] = bKey.split("#");
      const number = parseInt(numStr, 10);
      const build = allBuilds.find(b => b.jobName === jobName && b.number === number);
      if (!build) return null;
      const detailKey = `${jobName}#${number}`;
      const failedTests = buildDetails[detailKey]?.failedTests || [];
      return {
        ...build,
        failedTests
      };
    }).filter(Boolean) as (Build & {failedTests?: FailedTest[]})[];

    setBuildData(selectedData);
  }, [selectedBuilds]);

  // Compute metrics
  const totalTests = buildData.reduce((acc, b) => acc + (b.totalCount || 0), 0);
  const totalFailures = buildData.reduce((acc, b) => acc + (b.failCount || 0), 0);
  const passRate = totalTests > 0 ? (((totalTests - totalFailures) / totalTests) * 100).toFixed(2) : "N/A";

  function handleRunBuilds() {
    // In a real scenario, call Jenkins API here
    alert("Running selected builds (dummy)...");
  }

  function handleReRunTest(test: FailedTest) {
    // In a real scenario, call Jenkins API with parameters here
    alert(`Re-running test ${test.testName}... (dummy)`);
  }

  function handleCreateBugForTest(test: FailedTest) {
    setSelectedFailedTest(test);
    setIsBugModalOpen(true);
  }

  function handleBugSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In a real scenario, call TFS API with bugForm data
    const formObj = {...bugForm};
    alert(`Bug created with title: ${formObj.title}`);
    setIsBugModalOpen(false);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">QA Jenkins Dashboard</h1>

      {/* 1. View All Builds & Select them */}
      <div className="border p-4 rounded-md space-y-2">
        <h2 className="font-semibold text-lg">All Builds</h2>
        <div className="space-y-1">
          {allBuilds.map(b => {
            const buildKey = `${b.jobName}#${b.number}`;
            return (
              <div key={buildKey} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedBuilds.includes(buildKey)}
                  onCheckedChange={(checked:boolean) => {
                    if (checked) {
                      setSelectedBuilds(prev => [...prev, buildKey]);
                    } else {
                      setSelectedBuilds(prev => prev.filter(k => k !== buildKey));
                    }
                  }}
                />
                <label>{b.fullDisplayName} - {b.result}</label>
              </div>
            );
          })}
        </div>
        <Button onClick={handleRunBuilds}>Run Selected Builds</Button>
      </div>

      {/* 3. Metrics */}
      {buildData.length > 0 && (
        <div className="border p-4 rounded-md space-y-2">
          <h2 className="text-xl font-bold">Metrics for Selected Builds</h2>
          <p>Total Tests: {totalTests}</p>
          <p>Total Failed: {totalFailures}</p>
          <p>Pass Rate: {passRate}%</p>
        </div>
      )}

      {/* 4. Display failed tests */}
      {buildData.some(b => b.failedTests && b.failedTests.length > 0) && (
        <div className="border p-4 rounded-md">
          <h2 className="text-xl font-bold mb-4">Failed Tests</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Error Message</TableHead>
                <TableHead>Screenshot</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buildData.flatMap(b => b.failedTests || []).map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{test.testName}</TableCell>
                  <TableCell>{test.filePath}</TableCell>
                  <TableCell>{test.errorMessage}</TableCell>
                  <TableCell>
                    {test.screenshotUrl ? (
                      <a href={test.screenshotUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        View Screenshot
                      </a>
                    ) : "N/A"}
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    <Button variant="outline" onClick={() => {/* accept as failed logic here */}}>
                      Accept Failed
                    </Button>
                    <Button variant="outline" onClick={() => handleReRunTest(test)}>
                      Re-run Test
                    </Button>
                    <Button variant="outline" onClick={() => handleCreateBugForTest(test)}>
                      Create Bug
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 6. Modal for creating a TFS bug */}
      <Dialog open={isBugModalOpen} onOpenChange={setIsBugModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Bug in TFS</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleBugSubmit}>
            <Input placeholder="Title" value={bugForm.title} onChange={(e) => setBugForm({...bugForm, title: e.target.value})} />
            <Input placeholder="Assigned To" value={bugForm.assignedTo} onChange={(e) => setBugForm({...bugForm, assignedTo: e.target.value})}/>
            <Input placeholder="Area" value={bugForm.area} onChange={(e) => setBugForm({...bugForm, area: e.target.value})}/>
            <Input placeholder="Iteration" value={bugForm.iteration} onChange={(e) => setBugForm({...bugForm, iteration: e.target.value})}/>
            <Input placeholder="Reason" value={bugForm.reason} onChange={(e) => setBugForm({...bugForm, reason: e.target.value})}/>
            <Textarea placeholder="Steps to Reproduce" value={bugForm.stepsToRepro} onChange={(e) => setBugForm({...bugForm, stepsToRepro: e.target.value})}/>
            <Textarea placeholder="Description" value={bugForm.description} onChange={(e) => setBugForm({...bugForm, description: e.target.value})}/>
            <Input placeholder="Team" value={bugForm.team} onChange={(e) => setBugForm({...bugForm, team: e.target.value})}/>
            <Input placeholder="Effort" value={bugForm.effort} onChange={(e) => setBugForm({...bugForm, effort: e.target.value})}/>
            <Input placeholder="QA Resource" value={bugForm.qaResource} onChange={(e) => setBugForm({...bugForm, qaResource: e.target.value})}/>
            
            <div>
              <label className="block mb-1">Blocked?</label>
              <Select onValueChange={(val) => setBugForm({...bugForm, blocked: val === "true"})}>
                <SelectTrigger>
                  <SelectValue placeholder={bugForm.blocked ? "Yes" : "No"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input placeholder="Severity" value={bugForm.severity} onChange={(e) => setBugForm({...bugForm, severity: e.target.value})}/>
            <Input placeholder="Priority" value={bugForm.priority} onChange={(e) => setBugForm({...bugForm, priority: e.target.value})}/>
            <Input placeholder="Cause" value={bugForm.cause} onChange={(e) => setBugForm({...bugForm, cause: e.target.value})}/>
            <Input placeholder="Related Work" value={bugForm.relatedWork} onChange={(e) => setBugForm({...bugForm, relatedWork: e.target.value})}/>
            <Input placeholder="Application" value={bugForm.application} onChange={(e) => setBugForm({...bugForm, application: e.target.value})}/>
            <Input placeholder="Environment" value={bugForm.environment} onChange={(e) => setBugForm({...bugForm, environment: e.target.value})}/>
            <div>
              <label>Attachments</label>
              <Input type="file" multiple onChange={(e) => setBugForm({...bugForm, attachments: e.target.files})}/>
            </div>

            <DialogFooter>
              <Button type="submit">Submit Bug</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
