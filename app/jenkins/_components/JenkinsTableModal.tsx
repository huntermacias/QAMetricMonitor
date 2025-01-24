import React from "react";
import { Button } from "@/components/ui/button";
import { BuildData } from "@/types/tfs";
import SelectableList from "./SelectableList";

interface Props {
  selectedBuild: BuildData;
  closeModal: () => void;
  rerunBuild: (jobName: string) => void;
}

const JenkinsTableModal = ({ selectedBuild, closeModal, rerunBuild }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="w-full max-w-4xl border border-gray-700 rounded-lg shadow-xl p-6 relative bg-gray-900">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 className="text-2xl text-white font-semibold tracking-wide">
            Details for{" "}
            <span className="text-green-400">
              {selectedBuild.trimmedDisplayName}
            </span>{" "}
            <span className="text-yellow-400">#{selectedBuild.number}</span>
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-200 transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 px-4 h-[400px] overflow-y-auto">
          {/* Show any "failedTests" */}
          <SelectableList
            items={selectedBuild.failedTests || []}
            title="Failed Tests"
          />

          {/* Show "relatedBugs" if present */}
          {selectedBuild.relatedBugs && (
            <div className="mb-6">
              <h3 className="text-xl text-white font-semibold mb-2">
                Related Bugs
              </h3>
              {selectedBuild.relatedBugs.length > 0 ? (
                <ul className="space-y-2">
                  {selectedBuild.relatedBugs.map((bug) => (
                    <li key={bug.id}>
                      <a
                        href={bug.url}
                        className="text-blue-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {bug.title} ({bug.state})
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No related bugs found.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            className="border border-gray-600"
            variant={"secondary"}
            onClick={() => rerunBuild(selectedBuild.trimmedDisplayName)}
          >
            Rerun Build
          </Button>
          <Button
            variant={"destructive"}
            onClick={closeModal}
            className="px-4 py-2 rounded-md text-gray-200"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JenkinsTableModal;
