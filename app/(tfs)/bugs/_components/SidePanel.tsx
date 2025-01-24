import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface SidePanelProps {
  show: boolean;
  data: any | null;
  close: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ show, data, close }) => {
  if (!data) return null;

  return (
    <AnimatePresence>
    {show && (
      <motion.div
        className="fixed top-0 right-0 bottom-0 w-full max-w-xl z-50 border-l bg-gray-100 dark:bg-gray-950 border-gray-300 dark:border-gray-700 shadow-xl p-4 overflow-auto"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Work Item Details</h2>
          <Button variant="ghost" size="sm" onClick={close}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Separator className="mb-4" />
        {data && (
          <div className="space-y-2 text-sm">
            <p>
              <strong>ID:</strong> {data.id}
            </p>
            <p>
              <strong>Title:</strong> {data.system.Title}
            </p>
            <p>
              <strong>Type:</strong> {data.system.WorkItemType}
            </p>
            <p>
              <strong>State:</strong> {data.system.State}
            </p>
            <p>
              <strong>Assigned To:</strong>{" "}
              {data.system.AuthorizedAs.includes(
                "Microsoft.TeamFoundation.System"
              )
                ? "Unassigned"
                : data.system.AuthorizedAs}
            </p>
            <p>
              <strong>Team:</strong> {data.costcoTravel.Team}
            </p>
            <p>
              <strong>Tags:</strong>{" "}
              {data.parsedTags.length
                ? data.parsedTags.join(", ")
                : "N/A"}
            </p>
            {data.systemDescription && (
              <>
                <Separator className="my-2" />
                <div>
                  <strong>Description:</strong>
                  <p>{data.systemDescription}</p>
                </div>
              </>
            )}
            {data.relations && data.relations.length > 0 && (
              <div className="mt-2">
                <h3 className="font-semibold mb-2">Linked Items</h3>
                <ul className="list-disc list-inside space-y-1 text-blue-500 dark:text-blue-400">
                  {data.relations.map((rel:any, idx:number) => (
                    <li key={idx}>
                      {rel.rel} -{" "}
                      <a
                        href={rel.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {rel.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
  );
};

export default SidePanel;
