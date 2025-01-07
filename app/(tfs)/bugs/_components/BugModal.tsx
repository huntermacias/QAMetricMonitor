import Modal from '@/components/Modal';
import React from 'react'

type Props = {
    selectedWorkItem: any
    setSelectedWorkItem: any; 
}

const BugModal = ({selectedWorkItem, setSelectedWorkItem}: Props) => {
  return (
    <div>
          {selectedWorkItem && (
            <Modal onClose={() => setSelectedWorkItem(null)}>
              <div className="space-y-1 text-xs ">
                <h2 className="text-sm font-bold mb-2">
                  {selectedWorkItem.system.Title}
                </h2>
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
                  <strong>Assigned To:</strong> {selectedWorkItem.system.AuthorizedAs}
                </p>
                <p>
                  <strong>Team:</strong> {selectedWorkItem.costcoTravel.Team}
                </p>
                <p>
                  <strong>Effort:</strong>{' '}
                  {selectedWorkItem.microsoftVSTSCommonScheduling.Effort}
                </p>
                <p>
                  <strong>Description:</strong>
                </p>
                <div
                  className="prose prose-invert max-w-none text-xs leading-tight"
                  dangerouslySetInnerHTML={{
                    __html: selectedWorkItem.systemDescription || '',
                  }}
                />
              </div>
            </Modal>
          )}
    </div>
  )
}

export default BugModal;