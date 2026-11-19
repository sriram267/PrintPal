import type { FinishRecord } from "../../../../modules/leads/types"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { FinishEmptyIllustration, FinishRow } from "./FinishList"

export function renderFinishesPage({ openFinishPrompt, finishes, handleEditFinish, handleDeleteFinish }: { openFinishPrompt: (fin?: FinishRecord | null, targetService?: { siteIdx: number; srvIdx: number}  | null) => void; finishes: FinishRecord[]; handleEditFinish: (fin: FinishRecord) => void; handleDeleteFinish: (id: string, name: string) => void }): React.ReactNode {
  return <div className="w-full max-w-3xl mx-auto flex-1 min-h-0 flex flex-col overflow-hidden pb-4">
    {/* Header & Action Bar matching Reference Screen */}
    <section className="flex items-start justify-between mb-5 flex-shrink-0">
      <div className="printpal-leads-title-block">
        <h1 className="printpal-leads-title">Finishes</h1>
        <div className="printpal-leads-subtitle">
          Manage coatings, laminations, and surface finishing treatments
        </div>
      </div>

      <div className="printpal-leads-controls flex-shrink-0">
        <Button
          variant="orange"
          className="printpal-btn-primary font-medium w-[164px] min-w-[164px]"
          id="btn-add-finish"
          onClick={() => openFinishPrompt()}
        >
          Add new Finish
        </Button>
      </div>
    </section>

    {/* Centered Table Card */}
    <div className="flex-1 w-full min-h-0 bg-white border border-[#DCE1E5] rounded-[12px] p-2 flex flex-col box-border shadow-none overflow-hidden max-h-[calc(100vh-220px)]">
      <div className="flex items-center justify-between px-3 py-2 text-[12px] font-semibold text-[#737B84] bg-[#F8FAFC] rounded-[8px] flex-shrink-0 border-b border-[#E2E8F0]">
        <div>Finishes Name</div>
        <div className="text-right">Actions</div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll mt-1">
        {finishes.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#94A3B8]">
            <div className="printpal-empty-illustration-wrap scale-75 mb-2">
              <FinishEmptyIllustration />
            </div>
            No finishes cataloged yet. Click Add new Finish to add one.
          </div>
        ) : (
          finishes.map((fin) => (
            <FinishRow
              key={fin.id}
              fin={fin}
              onEdit={handleEditFinish}
              onDelete={handleDeleteFinish} />
          ))
        )}
      </div>
    </div>
  </div>
}
