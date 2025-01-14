import Modal from "@/components/Modal";
import { useState } from "react";
import { cn } from "@/lib/utils"; // If you have a utility for conditional classes

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

const BugModal = ({ selectedWorkItem, setSelectedWorkItem }: Props) => {
  const [showRelations, setShowRelations] = useState<boolean>(false);

  if (!selectedWorkItem) return null;

  const handleClose = () => setSelectedWorkItem(null);

  /**
   * TODO: implement logic to fetch attached file content,
   * display it in a modal or as markdown, etc., if `relation.rel === 'AttachedFile'`.
   */

  return (
    <Modal onClose={handleClose}>
      <div className="min-w-[320px] max-w-2xl p-4 md:p-6 rounded-md shadow-md space-y-4 text-sm">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl">
            {selectedWorkItem.system.Title}
          </h2>
          <button
            onClick={handleClose}
            className="transition-colors"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

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
          <div className="space-y-2">
            <button
              onClick={() => setShowRelations(!showRelations)}
              className={cn(
                "flex items-center font-semibold space-x-1 text-blue-600 hover:underline",
                "transition-colors"
              )}
            >
              <span>
                {showRelations ? "Hide Linked Items" : "Show Linked Items"}
              </span>
            </button>

            {showRelations && (
              <ul className="list-disc list-inside space-y-1 pt-2 pl-4 border-l border-gray-200">
                {selectedWorkItem.relations.map((relation:Relation, index:number) => {
                  const isFile = relation.rel === "AttachedFile";
                  return (
                    <li key={index} className="text-blue-600 hover:underline">
                      {isFile && relation.attributes?.name ? (
                        <span className="block">
                          <strong>Attached File:</strong>{" "}
                          {relation.attributes.name}
                        </span>
                      ) : (
                        <strong className="block ">
                          {relation.rel}
                        </strong>
                      )}

                      <a
                        href={relation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {relation.url}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BugModal;
