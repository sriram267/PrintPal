import type * as React from "react"
import type { useUser, useClerk } from "@clerk/react"
import { Users, FileText, Settings, HelpCircle, Bell, ChevronDown, LogOut } from "lucide-react"
import { palNotch } from "@printpal/ui"

export function renderTopNav({ setIsModalOpen, activeModule, closeNewCustomerModal, setActiveModule, setIsUserMenuOpen, user, isUserMenuOpen, clerk }: { setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>; activeModule: string; closeNewCustomerModal: () => void; setActiveModule: React.Dispatch<React.SetStateAction<"leads" | "quotation" | "quotationReports" | "settings">>; setIsUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>; user: ReturnType<typeof useUser>["user"]; isUserMenuOpen: boolean; clerk: ReturnType<typeof useClerk> }) {
  return <header className="printpal-top-nav flex-shrink-0">
    <div className="printpal-nav-left">
      <div className="printpal-brand-title" onClick={() => setIsModalOpen(false)}>
        PrintPal
      </div>

      <div className="printpal-nav-links">
        <button
          type="button"
          className={`printpal-nav-link ${activeModule === "leads" ? "active" : ""}`}
          onClick={() => {
            closeNewCustomerModal()
            setActiveModule("leads")
          } }
        >
          <Users />
          <span>Leads</span>
        </button>
        <button
          type="button"
          className={`printpal-nav-link ${activeModule === "quotation" ? "active" : ""}`}
          onClick={() => {
            closeNewCustomerModal()
            setActiveModule("quotation")
          } }
        >
          <FileText />
          <span>Quotation</span>
        </button>
        <button
          type="button"
          className={`printpal-nav-link ${activeModule === "quotationReports" ? "active" : ""}`}
          onClick={() => {
            closeNewCustomerModal()
            setActiveModule("quotationReports")
          } }
        >
          <FileText />
          <span>Quotation Reports</span>
        </button>
      </div>
    </div>

    {/* User Credential Component with Settings, Support & Notification on the right */}
    <div className="printpal-nav-right flex items-center gap-1.5">
      {/* Settings Nav Link */}
      <button
        type="button"
        className={`printpal-nav-link mr-2 ${activeModule === "settings" ? "active" : ""}`}
        onClick={() => {
          closeNewCustomerModal()
          setActiveModule("settings")
        } }
      >
        <Settings />
        <span>Settings</span>
      </button>

      {/* Support Icon */}
      <button
        type="button"
        className="w-9 h-9 flex items-center justify-center rounded-full text-[#737B84] hover:text-[#202428] hover:bg-[#F3F5F7] transition-colors cursor-pointer border-none bg-transparent"
        title="Help & Support"
        onClick={() => palNotch.info("Need help?", "Write to us at help@printpal.in")}
      >
        <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>

      {/* Notification Icon */}
      <button
        type="button"
        className="relative w-9 h-9 flex items-center justify-center rounded-full text-[#737B84] hover:text-[#202428] hover:bg-[#F3F5F7] transition-colors cursor-pointer border-none bg-transparent mr-1"
        title="Notifications"
        onClick={() => { } }
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>

      <div className="relative">
        <div
          className="printpal-user-pill"
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          role="button"
          tabIndex={0}
          title={user?.primaryEmailAddress?.emailAddress || "User Profile"}
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || "User Avatar"}
              className="w-8 h-8 rounded-full object-cover border border-[#E4E7EC]" />
          ) : (
            <div className="printpal-avatar">
              {(user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "P").toUpperCase()}
            </div>
          )}
          <span className="printpal-user-name">
            {user?.firstName || user?.fullName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Operator"}
          </span>
          <ChevronDown className={`printpal-user-chevron transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
        </div>

        {/* Dropdown Menu with Logout */}
        {isUserMenuOpen && (
          <>
            {/* Backdrop overlay to close menu when clicking outside */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsUserMenuOpen(false)} />
            <div
              className="absolute right-0 top-full mt-2 w-72 rounded-[16px] bg-white border border-[#E4E7EC] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              style={{ boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.15)" }}
            >
              <div className="flex items-center gap-3 pb-3 border-b border-[#F2F4F7]">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-[#E4E7EC] flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#FA772C] text-white font-semibold flex items-center justify-center text-[14px]/5 flex-shrink-0">
                    {(user?.firstName?.[0] || "P").toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[14px]/5 font-semibold text-[#101828] truncate">
                    {user?.fullName || "Workshop Operator"}
                  </div>
                  <div className="text-[12px]/4 text-[#667085] truncate font-sans mt-0.5">
                    {user?.primaryEmailAddress?.emailAddress || "Logged in"}
                  </div>
                </div>
              </div>

              <div className="py-2.5 px-1 text-[11px] text-[#475467] flex items-center justify-between">
                <span className="font-medium text-[#667085]">Workspace</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FA772C]/10 text-[#FA772C] font-semibold text-[10px]">
                  PrintPal ERP
                </span>
              </div>

              <div className="pt-2 border-t border-[#F2F4F7]">
                <button
                  type="button"
                  onClick={async () => {
                    setIsUserMenuOpen(false)
                    if (clerk) {
                      await clerk.signOut()
                    }
                  } }
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px]/4 font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out / Logout</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </header>
}
