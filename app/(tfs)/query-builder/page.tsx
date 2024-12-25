"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, Edit, BookMarked, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Represents a single query clause row.
 */
interface Clause {
  id: string;
  logicalOperator: "AND" | "OR";
  field: string;
  operator: string;
  value: string;
}

const INITIAL_CLAUSE: Clause = {
  id: Math.random().toString(),
  logicalOperator: "AND",
  field: "",
  operator: "",
  value: "",
};

const FIELDS = ["System.State", "System.Title", "System.WorkItemType", "System.AssignedTo", "System.Tags"];
const OPERATORS = ["=", "<>", "Contains", "Does Not Contain", "Begins With", "Ends With"];

const QueryBuilderPage = () => {
  // State for dynamic list of clauses
  const [clauses, setClauses] = useState<Clause[]>([
    { ...INITIAL_CLAUSE },
  ]);

  // Keep track of the query name and description if we want to “save” it
  const [queryName, setQueryName] = useState<string>("");
  const [queryDescription, setQueryDescription] = useState<string>("");

  // Modal for Save Query
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState<boolean>(false);

  // Example result after "run" the query
  const [queryResult, setQueryResult] = useState<string>("");

  // -------------------------------------------
  // Clause Handlers
  // -------------------------------------------

  function addNewClause() {
    setClauses((prev) => [
      ...prev,
      {
        ...INITIAL_CLAUSE,
        id: Math.random().toString(),
        logicalOperator: prev.length === 0 ? "AND" : "AND",
      },
    ]);
  }

  function removeClause(id: string) {
    setClauses((prev) => prev.filter((c) => c.id !== id));
  }

  function updateClause(
    id: string,
    field: keyof Omit<Clause, "id">,
    value: string
  ) {
    setClauses((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              [field]: value,
            }
          : c
      )
    );
  }

  // -------------------------------------------
  // Query Execution (simulated)
  // -------------------------------------------
  function runQuery() {
    // Example: Just show a string with the final query
    const result = clauses
      .map(
        (c) =>
          `${c.logicalOperator} ${c.field} ${c.operator} "${c.value}"`
      )
      .join("\n");
    setQueryResult(result);
  }

  // -------------------------------------------
  // Save Query
  // -------------------------------------------
  function saveQuery() {
    // In a real app, you'd POST to an API, store in DB, etc.
    // We'll just close the dialog and do nothing
    setIsSaveDialogOpen(false);
  }

  // Example “clear all” if needed
  function clearAllClauses() {
    setClauses([{ ...INITIAL_CLAUSE }]);
    setQueryResult("");
  }

  return (
    // middle column (most of the space)
    <div className="min-h-screen w-full mx-auto container p-8 border-x space-y-6">
      <header className="mb-6 text-center space-y-1">
        <h1 className="text-5xl font-bold tracking-wide underline decoration-wavy text-purple-300 mb-2">
          TFS Query Builder
        </h1>
        <p className="text-sm">
          Create advanced queries using AND/OR logic, then run or save your custom queries!
        </p>
      </header>

      {/* Query Builder Container */}
      <Card className=" ring ring-slate-950/5 border-white/10 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg  font-semibold">
            Build Your Query
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clauses.map((clause, index) => (
            <div key={clause.id}>
              {/* Clause Row */}
              <div className="flex flex-wrap items-center gap-3 p-3 bg-orange-700/5 border rounded-lg">
                {/* AND/OR Toggle */}
                {index > 0 && (
                  <RadioGroup
                    className="flex items-center space-x-4"
                    value={clause.logicalOperator}
                    onValueChange={(val:any) =>
                      updateClause(clause.id, "logicalOperator", val)
                    }
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem id={`and-${clause.id}`} value="AND" />
                      <label
                        htmlFor={`and-${clause.id}`}
                        className="text-xs "
                      >
                        AND
                      </label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem id={`or-${clause.id}`} value="OR" />
                      <label
                        htmlFor={`or-${clause.id}`}
                        className="text-xs "
                      >
                        OR
                      </label>
                    </div>
                  </RadioGroup>
                )}
                {/* Field Select */}
                <Select
                  value={clause.field}
                  onValueChange={(val) => updateClause(clause.id, "field", val)}
                >
                  <SelectTrigger className="w-40 text-xs">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Field</SelectLabel>
                      {FIELDS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {/* Operator Select */}
                <Select
                  value={clause.operator}
                  onValueChange={(val) =>
                    updateClause(clause.id, "operator", val)
                  }
                >
                  <SelectTrigger className="w-36 text-xs">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Operator</SelectLabel>
                      {OPERATORS.map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {/* Value Input */}
                <Input
                  className="w-36 text-xs"
                  placeholder="Value..."
                  value={clause.value}
                  onChange={(e) =>
                    updateClause(clause.id, "value", e.target.value)
                  }
                />
                {/* Remove Button */}
                {clauses.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-auto"
                    onClick={() => removeClause(clause.id)}
                  >
                    <Trash2 className="mr-1 w-3 h-3" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
          {/* Add Clause Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={addNewClause}
            className="space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Clause</span>
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={runQuery}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Run Query</span>
        </Button>
        <Button
          variant="secondary"
          onClick={clearAllClauses}
          className="space-x-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All</span>
        </Button>

        {/* Dialog for Save Query */}
        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-1">
              <BookMarked className="w-4 h-4" />
              <span>Save Query</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Save Your Query</DialogTitle>
              <DialogDescription>
                Provide a name and description for your custom query.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Query Name"
                onChange={(e) => {
                  /* handle name if needed */
                }}
              />
              <Input
                placeholder="Short Description"
                onChange={(e) => {
                  /* handle desc if needed */
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={saveQuery}>
                <Save className="mr-1 w-4 h-4" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Example: Query Result Display */}
      {/* <motion.div
        className="max-w-3xl mt-6 p-4 rounded-md bg-white/10 border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-semibold text-purple-300 mb-2">
          Query Result
        </h2>
        <p className="text-xs whitespace-pre-wrap">
          (Output of "Run Query" would appear here, or you can display your real query results.)
        </p>
      </motion.div> */}
    </div>
  );
};

export default QueryBuilderPage;
