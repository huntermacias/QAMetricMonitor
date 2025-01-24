import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Relation = {
  rel: string;
  url: string;
  attributes?: {
    authorizedDate?: string;
    resourceSize?: number;
    name?: string;
    [key: string]: any;
  };
};

type WorkItemSystem = {
  Title: string;
  WorkItemType: string;
  State: string;
  Reason: string;
  AuthorizedAs: string;
};

type WorkItemCostcoTravel = {
  Team: string;
};

type WorkItemScheduling = {
  Effort: number;
};

interface WorkItem {
  id: number;
  system: WorkItemSystem;
  costcoTravel: WorkItemCostcoTravel;
  microsoftVSTSCommonScheduling: WorkItemScheduling;
  relations?: Relation[];
  [key: string]: any;
}

type Props = {
  selectedWorkItem: any;
  setSelectedWorkItem: (item: any | null) => void;
};

/**
 * Modal Backdrop + Container
 * Using Framer Motion for fade/zoom transitions
 */
const BugModal = ({ selectedWorkItem, setSelectedWorkItem }: Props) => {
  if (!selectedWorkItem) return null;

  const handleClose = () => setSelectedWorkItem(null);

  // Close modal on Escape press
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Modal Content Container */}
        <motion.div
          key="modal-content"
          className="bg-gray-200 dark:bg-slate-800 w-full max-w-2xl mx-4 rounded-lg shadow-lg overflow-hidden relative"
          initial={{ scale: 0.95, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <header className="px-4 py-3 border-b flex items-center justify-between ">
            <h2 className="text-xl font-bold">
              {selectedWorkItem.system.Title}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close Modal"
            >
              ✕
            </button>
          </header>

          <div className="p-4 space-y-4 text-sm">
            {/* Basic Fields */}
            <div className="space-y-2">
              <p>
                <strong>ID:</strong> {selectedWorkItem.id}
              </p>
              <p>
                <strong>Type:</strong> {selectedWorkItem.system.WorkItemType}
              </p>
              <p>
                <strong>State:</strong> {selectedWorkItem.system.State}
              </p>
              <p>
                <strong>Reason:</strong> {selectedWorkItem.system.Reason}
              </p>
              <p>
                <strong>QA Resource:</strong>{" "}
                {selectedWorkItem.system.AuthorizedAs.includes(
                  "Microsoft.TeamFoundation.System"
                )
                  ? "Unassigned"
                  : selectedWorkItem.system.AuthorizedAs}
              </p>
              <p>
                <strong>Team:</strong> {selectedWorkItem.costcoTravel.Team}
              </p>
              <p>
                <strong>Effort:</strong>{" "}
                {selectedWorkItem.microsoftVSTSCommonScheduling.Effort}
              </p>
            </div>

            {/* Relations - Collapsible Section */}
            {selectedWorkItem.relations && selectedWorkItem.relations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Linked Items</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedWorkItem.relations.map((relation: Relation, index: number) => {
                    const isFile = relation.rel === "AttachedFile";
                    return (
                      <li key={index}>
                        {isFile && relation.attributes?.name ? (
                          <span>
                            <strong>Attached File:</strong>{" "}
                            {relation.attributes.name}
                          </span>
                        ) : (
                          // <strong className="block">{relation.rel}</strong>
                          <strong></strong>
                       
                        )}
                          <a
                            href={relation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {relation.url}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
      
            {/* Footer Actions (Optional) */}
            <footer className="px-4 py-3 border-t flex justify-end">
              <button
                onClick={handleClose}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors text-sm"
              >
                Close
              </button>
            </footer>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      ); };

      export default BugModal;