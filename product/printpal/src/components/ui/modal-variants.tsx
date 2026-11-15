import * as React from "react"
import {
  Check,
  CheckCircle2,
  Trash2,
  Save,
  Copy,
  Plus,
  Search,
  Lock,
  Mail,
  UploadCloud,
  User,
  Users,
  Building,
  Play,
  Pause,
  Settings,
  CreditCard,
  FileText,
  Video,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowRight,
  Tag,
  X,
} from "lucide-react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalIconBadge,
  ModalAvatarGroup,
  ModalButton,
  ModalCheckbox,
} from "./modal-system"

/* ─────────────────────────────────────────────────────────────────────────────
   1. Confirmation & Status Modals (Success, Unsaved, Delete, Access)
───────────────────────────────────────────────────────────────────────────── */
export function SuccessConfirmModal({
  open,
  onOpenChange,
  stacked = false,
  hasCheckbox = true,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stacked?: boolean
  hasCheckbox?: boolean
}) {
  const [dontShow, setDontShow] = React.useState(false)

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalIconBadge variant="success" className="mb-3">
            <Check className="h-5 w-5 stroke-[2.5]" />
          </ModalIconBadge>
          <ModalTitle>Blog post published</ModalTitle>
          <ModalDescription>
            This blog post has been published. Team members will be able to edit this post and
            republish changes.
          </ModalDescription>
        </ModalHeader>

        <ModalFooter layout={hasCheckbox ? "split" : stacked ? "stacked" : "horizontal"}>
          {hasCheckbox && (
            <ModalCheckbox
              id="success-dont-show"
              label="Don't show again"
              checked={dontShow}
              onCheckedChange={setDontShow}
            />
          )}
          <div className={`flex gap-3 ${stacked ? "flex-col w-full" : "items-center"}`}>
            <ModalButton
              variant="secondary"
              fullWidth={stacked}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ModalButton>
            <ModalButton
              variant="primary"
              fullWidth={stacked}
              onClick={() => onOpenChange(false)}
            >
              Confirm
            </ModalButton>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function UnsavedChangesModal({
  open,
  onOpenChange,
  stacked = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stacked?: boolean
}) {
  const [dontShow, setDontShow] = React.useState(false)

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalIconBadge variant="warning" className="mb-3">
            <Save className="h-5 w-5 stroke-[2.2]" />
          </ModalIconBadge>
          <ModalTitle>Unsaved changes</ModalTitle>
          <ModalDescription>
            Do you want to save or discard changes before leaving this project?
          </ModalDescription>
        </ModalHeader>

        <ModalFooter layout={stacked ? "stacked" : "split"}>
          {!stacked && (
            <ModalCheckbox
              id="unsaved-dont-show"
              label="Don't show again"
              checked={dontShow}
              onCheckedChange={setDontShow}
            />
          )}
          <div className={`flex gap-3 ${stacked ? "flex-col w-full" : "items-center"}`}>
            <ModalButton
              variant="secondary"
              fullWidth={stacked}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ModalButton>
            <ModalButton
              variant="primary"
              fullWidth={stacked}
              onClick={() => onOpenChange(false)}
            >
              Confirm
            </ModalButton>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function DestructiveDeleteModal({
  open,
  onOpenChange,
  stacked = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stacked?: boolean
}) {
  const [dontShow, setDontShow] = React.useState(false)

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalIconBadge variant="destructive" className="mb-3">
            <Trash2 className="h-5 w-5 stroke-[2.2]" />
          </ModalIconBadge>
          <ModalTitle>Delete blog post</ModalTitle>
          <ModalDescription>
            Are you sure you want to delete this post? This action cannot be undone and will permanently
            remove all associated media.
          </ModalDescription>
        </ModalHeader>

        <ModalFooter layout={stacked ? "stacked" : "split"}>
          {!stacked && (
            <ModalCheckbox
              id="del-dont-show"
              label="Don't show again"
              checked={dontShow}
              onCheckedChange={setDontShow}
            />
          )}
          <div className={`flex gap-3 ${stacked ? "flex-col w-full" : "items-center"}`}>
            <ModalButton
              variant="secondary"
              fullWidth={stacked}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ModalButton>
            <ModalButton
              variant="destructive"
              fullWidth={stacked}
              onClick={() => onOpenChange(false)}
            >
              Delete
            </ModalButton>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function AccessRequestModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [dontShow, setDontShow] = React.useState(false)

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalIconBadge variant="gray" shape="square" className="mb-3">
            <User className="h-5 w-5" />
          </ModalIconBadge>
          <ModalTitle>Candice has requested edit access</ModalTitle>
          <ModalDescription>
            One of your team has requested edit access to your project Website Design.
          </ModalDescription>
        </ModalHeader>

        <ModalBody>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-[#EAECF0] bg-[#F9FAFB]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&auto=format&fit=crop&q=80"
              alt="Candice Wu"
              className="h-10 w-10 rounded-full object-cover ring-1 ring-black/5"
            />
            <div>
              <div className="text-sm font-semibold text-[#101828]">Candice Wu</div>
              <div className="text-xs text-[#475467]">candice@untitledui.com</div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter layout="split">
          <ModalCheckbox
            id="req-dont-show"
            label="Don't show again"
            checked={dontShow}
            onCheckedChange={setDontShow}
          />
          <div className="flex gap-3">
            <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </ModalButton>
            <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
              Confirm
            </ModalButton>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. Team & Collaboration Modals
───────────────────────────────────────────────────────────────────────────── */
export function TeamAddedCenteredModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader align="center" className="pt-8">
          <ModalAvatarGroup className="mb-2" />
          <ModalTitle className="text-center text-xl mt-1">You've been added to the team!</ModalTitle>
          <ModalDescription className="text-center max-w-[320px]">
            Thanks for accepting the invite. You've now been added to the team as an editor.
          </ModalDescription>
        </ModalHeader>

        <ModalFooter layout="horizontal" className="pt-6 border-t border-[#EAECF0]">
          <div className="grid grid-cols-2 gap-3 w-full">
            <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </ModalButton>
            <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
              Confirm
            </ModalButton>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function InviteShareLinkModal({
  open,
  onOpenChange,
  stacked = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stacked?: boolean
}) {
  const [copied, setCopied] = React.useState(false)
  const link = "join.untitledui.com/project"

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader align="center" className="pt-7">
          <ModalAvatarGroup className="mb-2" />
          <ModalTitle className="text-center mt-1">Invite your team</ModalTitle>
          <ModalDescription className="text-center max-w-[340px]">
            You've created a new project! Invite colleagues to collaborate on this project.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="pt-2">
          <label className="text-xs font-medium text-[#344054] block mb-1.5">Share link</label>
          <div className="flex items-center rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 shadow-xs focus-within:ring-2 focus-within:ring-[#7F56D9]">
            <input
              type="text"
              readOnly
              value={link}
              className="w-full text-sm text-[#344054] bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="ml-2 text-[#667085] hover:text-[#101828] transition-colors"
              title="Copy link"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </ModalBody>

        <ModalFooter layout={stacked ? "stacked" : "horizontal"} className="border-t border-[#EAECF0] mt-3">
          <div className={`grid ${stacked ? "grid-cols-1" : "grid-cols-2"} gap-3 w-full`}>
            {stacked ? (
              <>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
              </>
            ) : (
              <>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
              </>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function TeamMembersListModal({
  open,
  onOpenChange,
  stacked = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stacked?: boolean
}) {
  const [selected, setSelected] = React.useState<string[]>(["candice", "demi", "drew", "natali"])

  const members = [
    {
      id: "candice",
      name: "Candice Wu",
      handle: "@candice",
      role: "Admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&auto=format&fit=crop&q=80",
    },
    {
      id: "demi",
      name: "Demi Wilkinson",
      handle: "@demi",
      role: "Admin",
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&auto=format&fit=crop&q=80",
    },
    {
      id: "drew",
      name: "Drew Cano",
      handle: "@drew",
      role: "Editor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&auto=format&fit=crop&q=80",
    },
    {
      id: "natali",
      name: "Natali Crag",
      handle: "@natali",
      role: "Editor",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&auto=format&fit=crop&q=80",
    },
  ]

  const toggleMember = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader align="center" className="pt-7">
          <ModalAvatarGroup className="mb-2" />
          <ModalTitle className="text-center mt-1">Add your team members</ModalTitle>
          <ModalDescription className="text-center max-w-[340px]">
            You've created a new project! Invite colleagues to collaborate on this project.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="py-2 space-y-3">
          {members.map((m) => {
            const isChecked = selected.includes(m.id)
            return (
              <div
                key={m.id}
                onClick={() => toggleMember(m.id)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F9FAFB] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-[#D0D5DD] text-[#7F56D9] focus:ring-0 cursor-pointer"
                  />
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-black/5"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#101828]">{m.name}</div>
                    <div className="text-xs text-[#475467]">{m.handle}</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#475467] px-2 py-0.5 rounded-full bg-[#F2F4F7]">
                  {m.role}
                </span>
              </div>
            )
          })}
        </ModalBody>

        <ModalFooter layout={stacked ? "stacked" : "horizontal"} className="border-t border-[#EAECF0] mt-3">
          <div className={`grid ${stacked ? "grid-cols-1" : "grid-cols-2"} gap-3 w-full`}>
            {stacked ? (
              <>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
              </>
            ) : (
              <>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
              </>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function InviteCollaboratorsModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [emails, setEmails] = React.useState(["you@untitledui.com", "you@untitledui.com"])

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalIconBadge variant="gray" shape="square" className="mb-3">
            <Users className="h-5 w-5" />
          </ModalIconBadge>
          <ModalTitle>Invite collaborators</ModalTitle>
          <ModalDescription>
            Your new project has been created. Invite colleagues to collaborate on this project.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-3">
          <label className="text-xs font-medium text-[#344054] block">Email address</label>
          {emails.map((email, idx) => (
            <div
              key={idx}
              className="flex items-center rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 shadow-xs focus-within:ring-2 focus-within:ring-[#7F56D9]"
            >
              <Mail className="h-4 w-4 text-[#667085] mr-2" />
              <input
                type="email"
                defaultValue={email}
                placeholder="colleague@example.com"
                className="w-full text-sm text-[#344054] bg-transparent focus:outline-none"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setEmails([...emails, ""])}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7F56D9] hover:text-[#6941C6] pt-1"
          >
            <Plus className="h-4 w-4" />
            Add another
          </button>
        </ModalBody>

        <ModalFooter layout="horizontal">
          <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
            Confirm
          </ModalButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. Plans & Payment Modals
───────────────────────────────────────────────────────────────────────────── */
export function ChangePlanRadioModal({
  open,
  onOpenChange,
  stacked = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stacked?: boolean
}) {
  const [selectedPlan, setSelectedPlan] = React.useState("basic")

  const plans = [
    {
      id: "basic",
      name: "Basic plan",
      price: "$10/month",
      desc: "Up to 10 users and 20GB individual data.",
      icon: Layers,
    },
    {
      id: "business",
      name: "Business plan",
      price: "$20/month",
      desc: "Up to 20 users and 40GB individual data.",
      icon: Layers,
    },
    {
      id: "enterprise",
      name: "Enterprise plan",
      price: "$40/month",
      desc: "Unlimited users and unlimited individual data.",
      icon: TrendingUp,
    },
  ]

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalIconBadge variant="gray" shape="square" className="mb-3">
            <Layers className="h-5 w-5" />
          </ModalIconBadge>
          <ModalTitle>Change your plan</ModalTitle>
          <ModalDescription>Flexible pricing that grows with you.</ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-3">
          {plans.map((p) => {
            const isSelected = selectedPlan === p.id
            const IconComp = p.icon
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#7F56D9] bg-[#F9F5FF] ring-2 ring-[#7F56D9]/20"
                    : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                    isSelected
                      ? "bg-[#F4EBFF] text-[#7F56D9] border-[#E9D7FE]"
                      : "bg-[#F9FAFB] text-[#667085] border-[#EAECF0]"
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#101828]">
                      {p.name}{" "}
                      <span className="font-normal text-[#475467]">{p.price}</span>
                    </span>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-[#7F56D9] bg-[#7F56D9] text-white"
                          : "border-[#D0D5DD] bg-white"
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-[#475467] mt-0.5">{p.desc}</p>
                </div>
              </div>
            )
          })}
        </ModalBody>

        <ModalFooter layout={stacked ? "stacked" : "horizontal"}>
          <div className={`grid ${stacked ? "grid-cols-1" : "grid-cols-2"} gap-3 w-full`}>
            {stacked ? (
              <>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
              </>
            ) : (
              <>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
              </>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function PlanComparisonMatrixModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedPlan, setSelectedPlan] = React.useState("basic")
  const [dontShow, setDontShow] = React.useState(false)

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="xl">
        <ModalHeader className="border-b border-[#EAECF0] pb-4">
          <div className="flex items-center gap-3">
            <ModalIconBadge variant="gray" shape="square">
              <Layers className="h-5 w-5" />
            </ModalIconBadge>
            <div>
              <ModalTitle>Select plan</ModalTitle>
              <ModalDescription>Simple and flexible per-user pricing.</ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Basic */}
            <div
              onClick={() => setSelectedPlan("basic")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedPlan === "basic"
                  ? "border-[#7F56D9] ring-2 ring-[#7F56D9]/20 bg-white"
                  : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#101828]">$10/mth</div>
                  <div className="text-sm font-semibold text-[#101828] mt-0.5">Basic plan</div>
                  <div className="text-xs text-[#475467]">Billed annually</div>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                    selectedPlan === "basic"
                      ? "border-[#7F56D9] bg-[#7F56D9] text-white"
                      : "border-[#D0D5DD]"
                  }`}
                >
                  {selectedPlan === "basic" && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#EAECF0] space-y-2.5 text-xs text-[#344054]">
                {[
                  "Basic features",
                  "Basic reporting",
                  "Up to 10 individual users",
                  "20GB data per user",
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#7F56D9] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Business */}
            <div
              onClick={() => setSelectedPlan("business")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedPlan === "business"
                  ? "border-[#7F56D9] ring-2 ring-[#7F56D9]/20 bg-white"
                  : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#101828]">$20/mth</div>
                  <div className="text-sm font-semibold text-[#101828] mt-0.5">Business plan</div>
                  <div className="text-xs text-[#475467]">Billed annually</div>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                    selectedPlan === "business"
                      ? "border-[#7F56D9] bg-[#7F56D9] text-white"
                      : "border-[#D0D5DD]"
                  }`}
                >
                  {selectedPlan === "business" && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#EAECF0] space-y-2.5 text-xs text-[#344054]">
                {[
                  "Advanced features",
                  "Advanced reporting",
                  "Up to 20 individual users",
                  "40GB data per user",
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#7F56D9] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter layout="split">
          <div className="flex items-center gap-4">
            <ModalCheckbox
              id="plan-dont-show"
              label="Don't show again"
              checked={dontShow}
              onCheckedChange={setDontShow}
            />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475467] hover:text-[#101828]"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </button>
          </div>
          <div className="flex gap-3">
            <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </ModalButton>
            <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
              Confirm
            </ModalButton>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function CreditCardModal({
  open,
  onOpenChange,
  showCardVisual = true,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  showCardVisual?: boolean
}) {
  const [name, setName] = React.useState("Olivia Rhye")
  const [expiry, setExpiry] = React.useState("06 / 2028")
  const [number, setNumber] = React.useState("1234 1234 1234 1234")
  const [cvv, setCvv] = React.useState("123")

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        {showCardVisual && (
          <div className="p-6 pb-0">
            <div className="relative h-44 rounded-2xl bg-gradient-to-tr from-[#FFD6A5] via-[#FDFFB6] to-[#CAFFBF] p-5 shadow-inner border border-white/40 overflow-hidden flex flex-col justify-between">
              {/* Glass Card Surface */}
              <div className="flex items-center justify-between text-xs font-semibold text-[#344054]">
                <span>Untitled.</span>
                <span className="text-base tracking-widest">)))</span>
              </div>
              <div>
                <div className="flex justify-between text-[11px] uppercase tracking-wider text-[#475467] font-medium mb-1">
                  <span>{name || "YOUR NAME"}</span>
                  <span>{expiry || "MM/YY"}</span>
                </div>
                <div className="flex items-center justify-between font-mono text-sm tracking-widest text-[#101828]">
                  <span>{number || "•••• •••• •••• ••••"}</span>
                  <div className="flex -space-x-1">
                    <div className="h-4 w-4 rounded-full bg-[#EB001B]/80" />
                    <div className="h-4 w-4 rounded-full bg-[#F79E1B]/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <ModalHeader className={showCardVisual ? "pt-4" : ""}>
          {!showCardVisual && (
            <ModalIconBadge variant="gray" shape="square" className="mb-3">
              <CreditCard className="h-5 w-5" />
            </ModalIconBadge>
          )}
          <ModalTitle>Update payment method</ModalTitle>
          <ModalDescription>Update your card details.</ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-[#344054] block mb-1">Name on card</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#344054] block mb-1">Expiry</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-[#344054] block mb-1">Card number</label>
              <div className="flex items-center h-10 px-3 rounded-lg border border-[#D0D5DD] bg-white focus-within:ring-2 focus-within:ring-[#7F56D9]">
                <div className="flex -space-x-1 mr-2 shrink-0">
                  <div className="h-3.5 w-3.5 rounded-full bg-[#EB001B]" />
                  <div className="h-3.5 w-3.5 rounded-full bg-[#F79E1B]" />
                </div>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full text-sm bg-transparent focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#344054] block mb-1">CVV</label>
              <input
                type="password"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter layout="horizontal">
          <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
            Confirm
          </ModalButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. Media & Onboarding Modals
───────────────────────────────────────────────────────────────────────────── */
export function FileUploadModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Upload and attach files</ModalTitle>
          <ModalDescription>Upload and attach files to this project.</ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {/* Dropzone */}
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#D0D5DD] rounded-xl hover:border-[#7F56D9] transition-colors cursor-pointer bg-[#F9FAFB]/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4EBFF] text-[#7F56D9] mb-2">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div className="text-xs font-semibold text-[#101828]">
              <span className="text-[#7F56D9]">Click to upload</span> or drag and drop
            </div>
            <p className="text-[11px] text-[#475467] mt-0.5">SVG, PNG, JPG or GIF (max. 800×400px)</p>
          </div>

          {/* Upload Queue Item 1 (100% Done) */}
          <div className="p-3.5 rounded-xl border border-[#7F56D9] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4EBFF] text-[#7F56D9]">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#101828]">Tech design requirements.pdf</div>
                  <div className="text-[11px] text-[#667085]">200 KB</div>
                </div>
              </div>
              <CheckCircle2 className="h-4 w-4 text-[#7F56D9]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-full rounded-full bg-[#EAECF0] overflow-hidden">
                <div className="h-full bg-[#7F56D9] w-full rounded-full" />
              </div>
              <span className="text-[11px] font-medium text-[#344054]">100%</span>
            </div>
          </div>

          {/* Upload Queue Item 2 (40% In-progress) */}
          <div className="p-3.5 rounded-xl border border-[#EAECF0] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4EBFF] text-[#7F56D9]">
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#101828]">Dashboard recording.mp4</div>
                  <div className="text-[11px] text-[#667085]">16 MB</div>
                </div>
              </div>
              <Trash2 className="h-4 w-4 text-[#667085] hover:text-red-600 cursor-pointer transition-colors" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-full rounded-full bg-[#EAECF0] overflow-hidden">
                <div className="h-full bg-[#7F56D9] w-[40%] rounded-full" />
              </div>
              <span className="text-[11px] font-medium text-[#344054]">40%</span>
            </div>
          </div>
        </ModalBody>

        <ModalFooter layout="horizontal">
          <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
            Confirm
          </ModalButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function ImageHeroModal({
  open,
  onOpenChange,
  stacked = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stacked?: boolean
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <div className="p-4 pb-0">
          <img
            src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80"
            alt="Rubber plant leaves"
            className="h-48 w-full rounded-xl object-cover"
          />
        </div>

        <ModalHeader align="center" className="pt-4">
          <ModalTitle className="text-center">Blog post published</ModalTitle>
          <ModalDescription className="text-center max-w-[340px]">
            This blog post has been published. Team members will be able to edit this post and republish
            changes.
          </ModalDescription>
        </ModalHeader>

        <ModalFooter layout={stacked ? "stacked" : "horizontal"}>
          <div className={`grid ${stacked ? "grid-cols-1" : "grid-cols-2"} gap-3 w-full`}>
            {stacked ? (
              <>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
              </>
            ) : (
              <>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
              </>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function VideoOnboardingModal({
  open,
  onOpenChange,
  stacked = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stacked?: boolean
}) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [activeStep, setActiveStep] = React.useState(0)

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <div className="p-4 pb-0">
          <div className="relative h-52 w-full rounded-xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"
              alt="Welcome video presenter"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-black hover:bg-white shadow"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                </button>
                <div className="h-1.5 flex-1 rounded-full bg-white/40 overflow-hidden">
                  <div className="h-full bg-white w-2/3 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ModalHeader align="center" className="pt-4">
          <ModalTitle className="text-center">Welcome to your dashboard</ModalTitle>
          <ModalDescription className="text-center max-w-[340px]">
            We're glad to have you onboard. Here are some quick tips to get you up and running.
          </ModalDescription>
          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 pt-3">
            {[0, 1, 2, 3].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setActiveStep(step)}
                className={`h-2 rounded-full transition-all ${
                  activeStep === step ? "w-4 bg-[#7F56D9]" : "w-2 bg-[#EAECF0]"
                }`}
              />
            ))}
          </div>
        </ModalHeader>

        <ModalFooter layout={stacked ? "stacked" : "horizontal"}>
          <div className={`grid ${stacked ? "grid-cols-1" : "grid-cols-2"} gap-3 w-full`}>
            {stacked ? (
              <>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
              </>
            ) : (
              <>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
              </>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function ImageCropperModal({
  open,
  onOpenChange,
  stacked = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stacked?: boolean
}) {
  const [selectedGradient, setSelectedGradient] = React.useState(0)
  const [dontShow, setDontShow] = React.useState(false)

  const gradients = [
    "from-amber-300 via-rose-300 to-indigo-300",
    "from-pink-300 via-purple-300 to-indigo-400",
    "from-yellow-200 via-green-200 to-teal-300",
    "from-blue-400 via-indigo-400 to-purple-500",
    "from-rose-400 via-fuchsia-400 to-indigo-500",
    "from-emerald-300 to-sky-400",
    "from-violet-400 to-pink-300",
    "from-cyan-300 to-blue-400",
  ]

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Crop header image</ModalTitle>
          <ModalDescription>Upload a 1600 × 480px image for best results.</ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {/* Checkered Canvas with Crop Frame */}
          <div className="relative h-48 w-full rounded-xl overflow-hidden border border-[#D0D5DD] bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px] bg-[#F8FAFC]">
            <div
              className={`absolute inset-x-4 inset-y-6 rounded-lg bg-gradient-to-r ${gradients[selectedGradient]} shadow-md`}
            >
              {/* Crop Frame Overlay with Resizing Handles */}
              <div className="absolute inset-0 border-2 border-[#7F56D9]">
                <div className="absolute -top-1.5 -left-1.5 h-3 w-3 bg-white border-2 border-[#7F56D9]" />
                <div className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-white border-2 border-[#7F56D9]" />
                <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 bg-white border-2 border-[#7F56D9]" />
                <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-white border-2 border-[#7F56D9]" />
              </div>
            </div>
          </div>

          {/* Palette Swatches */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {gradients.map((grad, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedGradient(idx)}
                className={`h-8 w-8 rounded-full bg-gradient-to-tr ${grad} shrink-0 transition-transform ${
                  selectedGradient === idx
                    ? "ring-2 ring-offset-2 ring-[#7F56D9] scale-110"
                    : "hover:scale-105"
                }`}
              />
            ))}
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D0D5DD] text-[#667085] hover:bg-[#F9FAFB] shrink-0"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </ModalBody>

        <ModalFooter layout={stacked ? "stacked" : "split"}>
          {!stacked && (
            <ModalCheckbox
              id="crop-dont-show"
              label="Don't show again"
              checked={dontShow}
              onCheckedChange={setDontShow}
            />
          )}
          <div className={`grid ${stacked ? "grid-cols-1" : "grid-cols-2"} gap-3 w-full sm:w-auto`}>
            {stacked ? (
              <>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
              </>
            ) : (
              <>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
              </>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. Forms & Inputs Modals (Tags, 2FA, Social, Auth, Profile)
───────────────────────────────────────────────────────────────────────────── */
export function TagLabelsModal({
  open,
  onOpenChange,
  stacked = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stacked?: boolean
}) {
  const [search, setSearch] = React.useState("")
  const [tags, setTags] = React.useState([
    { name: "In progress", color: "bg-sky-50 text-sky-700 border-sky-200" },
    { name: "Design", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { name: "Web", color: "bg-pink-50 text-pink-700 border-pink-200" },
  ])

  const removeTag = (name: string) => {
    setTags((prev) => prev.filter((t) => t.name !== name))
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalIconBadge variant="gray" shape="square" className="mb-3">
            <Tag className="h-5 w-5" />
          </ModalIconBadge>
          <ModalTitle>Add labels to project</ModalTitle>
          <ModalDescription>Labels help organize projects.</ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-3">
          <div className="flex items-center rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 shadow-xs focus-within:ring-2 focus-within:ring-[#7F56D9]">
            <Search className="h-4 w-4 text-[#667085] mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search for label"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm text-[#344054] bg-transparent focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[#667085] hover:text-[#344054] shrink-0 p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <span
                key={tag.name}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${tag.color}`}
              >
                <span>{tag.name}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag.name)}
                  className="hover:opacity-75 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </ModalBody>

        <ModalFooter layout={stacked ? "stacked" : "horizontal"}>
          <div className={`grid ${stacked ? "grid-cols-1" : "grid-cols-2"} gap-3 w-full`}>
            {stacked ? (
              <>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
              </>
            ) : (
              <>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
              </>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function TwoFactorAuthModal({
  open,
  onOpenChange,
  stacked = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stacked?: boolean
}) {
  const [code, setCode] = React.useState(["", "", "", "", "", ""])

  const handleInput = (idx: number, val: string) => {
    if (val.length > 1) val = val[0]
    const next = [...code]
    next[idx] = val
    setCode(next)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalIconBadge variant="gray" shape="square" className="mb-3">
            <Lock className="h-5 w-5" />
          </ModalIconBadge>
          <ModalTitle>Set up two-factor authentication</ModalTitle>
          <ModalDescription>
            To authorise transactions, please scan this QR code with your Google Authenticator App
            and enter the verification code below.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {/* QR Code Container */}
          <div className="flex items-center justify-center p-6 bg-[#F9FAFB] rounded-xl border border-[#EAECF0]">
            <div className="h-32 w-32 bg-white p-2 rounded-lg border shadow-xs flex items-center justify-center">
              {/* Stylized QR Code SVG */}
              <svg className="h-28 w-28" viewBox="0 0 100 100" fill="currentColor">
                <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M22,22 h6 v6 h-6 z" />
                <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M72,22 h6 v6 h-6 z" />
                <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M22,72 h6 v6 h-6 z" />
                <path d="M48,15 h6 v15 h-6 z M48,40 h15 v6 h-15 z M70,48 h15 v8 h-15 z M45,65 h12 v20 h-12 z M65,65 h20 v12 h-20 z" />
              </svg>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#344054] block mb-2">Verification code</label>
            <div className="flex items-center justify-between gap-1.5">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={code[i]}
                  onChange={(e) => handleInput(i, e.target.value)}
                  className="h-12 w-11 text-center font-semibold text-lg rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                />
              ))}
              <span className="text-[#98A2B3] font-bold">-</span>
              {[3, 4, 5].map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={code[i]}
                  onChange={(e) => handleInput(i, e.target.value)}
                  className="h-12 w-11 text-center font-semibold text-lg rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                />
              ))}
            </div>
            <div className="text-xs text-[#475467] mt-2">
              Didn't get a code?{" "}
              <button type="button" className="font-semibold text-[#7F56D9] underline">
                Click to resend
              </button>
            </div>
          </div>
        </ModalBody>

        <ModalFooter layout={stacked ? "stacked" : "horizontal"}>
          <div className={`grid ${stacked ? "grid-cols-1" : "grid-cols-2"} gap-3 w-full`}>
            {stacked ? (
              <>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
              </>
            ) : (
              <>
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Confirm
                </ModalButton>
              </>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function SocialShareTogglesModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [toggles, setToggles] = React.useState({
    twitter: true,
    medium: true,
    facebook: false,
  })

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalIconBadge variant="success" className="mb-3">
            <Check className="h-5 w-5 stroke-[2.5]" />
          </ModalIconBadge>
          <ModalTitle>Blog post published</ModalTitle>
          <ModalDescription>
            This blog post has been published. Team members will be able to edit this post and
            republish changes.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-3.5">
          {[
            { id: "twitter", name: "Share on Twitter", sub: "@yourcompany" },
            { id: "medium", name: "Share on Medium", sub: "yourcompany.medium.com" },
            { id: "facebook", name: "Share on Facebook", sub: "@yourcompany" },
          ].map((item) => {
            const isChecked = toggles[item.id as keyof typeof toggles]
            return (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#101828]">{item.name}</div>
                  <div className="text-xs text-[#667085]">{item.sub}</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setToggles((prev) => ({
                      ...prev,
                      [item.id]: !prev[item.id as keyof typeof toggles],
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isChecked ? "bg-[#7F56D9]" : "bg-[#EAECF0]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                      isChecked ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </ModalBody>

        <ModalFooter layout="horizontal">
          <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
            Confirm
          </ModalButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function AuthLoginModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [remember, setRemember] = React.useState(false)

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader align="center" className="pt-6">
          <ModalIconBadge variant="gray" shape="square" className="mb-2">
            <ArrowRight className="h-5 w-5" />
          </ModalIconBadge>
          <ModalTitle className="text-center">Log in to your account</ModalTitle>
          <ModalDescription className="text-center">
            Welcome back! Please enter your details.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[#344054] block mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full h-10 px-3 text-sm rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#344054] block mb-1">Password</label>
            <input
              type="password"
              defaultValue="••••••••"
              className="w-full h-10 px-3 text-sm rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <ModalCheckbox
              id="login-remember"
              label="Remember for 30 days"
              checked={remember}
              onCheckedChange={setRemember}
            />
            <button type="button" className="text-xs font-semibold text-[#7F56D9] hover:underline">
              Forgot password
            </button>
          </div>
        </ModalBody>

        <ModalFooter layout="stacked">
          <ModalButton variant="primary" fullWidth onClick={() => onOpenChange(false)}>
            Confirm
          </ModalButton>
          <ModalButton variant="secondary" fullWidth onClick={() => onOpenChange(false)}>
            Cancel
          </ModalButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function CompanyProfileModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader className="border-b border-[#EAECF0] pb-4">
          <ModalTitle>Add your company</ModalTitle>
          <ModalDescription>Create your company profile for free.</ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-3.5 pt-4">
          <div>
            <label className="text-xs font-medium text-[#344054] block mb-1">Company name*</label>
            <input
              type="text"
              placeholder="e.g. Linear"
              className="w-full h-10 px-3 text-sm rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#344054] block mb-1">Website URL*</label>
            <input
              type="text"
              placeholder="www.example.com"
              className="w-full h-10 px-3 text-sm rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full border border-dashed border-[#D0D5DD] flex items-center justify-center bg-[#F9FAFB] text-[#667085]">
              <Building className="h-5 w-5" />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-[#F9FAFB] shadow-xs"
            >
              <UploadCloud className="h-4 w-4" />
              Upload photo
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-[#344054] block mb-1">Username*</label>
            <div className="flex h-10 rounded-lg border border-[#D0D5DD] overflow-hidden focus-within:ring-2 focus-within:ring-[#7F56D9]">
              <span className="inline-flex items-center px-3 bg-[#F9FAFB] border-r border-[#D0D5DD] text-xs text-[#667085]">
                untitledui.com/
              </span>
              <input
                type="text"
                placeholder="example"
                className="flex-1 px-3 text-sm bg-white focus:outline-none"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter layout="stacked">
          <ModalButton variant="primary" fullWidth onClick={() => onOpenChange(false)}>
            Confirm
          </ModalButton>
          <ModalButton variant="secondary" fullWidth onClick={() => onOpenChange(false)}>
            Cancel
          </ModalButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. Date Picker Menu Modal / Popover
───────────────────────────────────────────────────────────────────────────── */
export function DateRangePickerMenuModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [preset, setPreset] = React.useState("Last week")
  const [startDate, setStartDate] = React.useState("Jan 6, 2027")
  const [endDate, setEndDate] = React.useState("Jan 20, 2027")

  const presets = [
    "Today",
    "Yesterday",
    "This week",
    "Last week",
    "This month",
    "Last month",
    "This year",
    "Last year",
    "All time",
  ]

  // Mock Calendar 1 (Jan 2027)
  const janDays = [
    [26, 27, 28, 29, 30, 31, 1],
    [2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22],
    [23, 24, 25, 26, 27, 28, 29],
    [30, 31, 1, 2, 3, 4, 5],
  ]

  // Mock Calendar 2 (Feb 2027)
  const febDays = [
    [30, 31, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25, 26],
    [27, 28, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11, 12],
  ]

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="2xl">
        <div className="flex flex-col sm:flex-row">
          {/* Left Presets Sidebar */}
          <div className="w-full sm:w-44 border-b sm:border-b-0 sm:border-r border-[#EAECF0] p-3 space-y-0.5 bg-[#F9FAFB]/50">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  preset === p
                    ? "bg-white text-[#101828] font-semibold shadow-xs border border-[#EAECF0]"
                    : "text-[#475467] hover:bg-[#F2F4F7]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Right Dual Calendar View */}
          <div className="flex-1 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Month 1: Jan 2027 */}
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-[#101828]">
                  <ChevronLeft className="h-4 w-4 text-[#667085] cursor-pointer" />
                  <span>January 2027</span>
                  <ChevronRight className="h-4 w-4 text-[#667085] cursor-pointer" />
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-[#667085] font-medium mb-1">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sat", "Su"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {janDays.flat().map((d, i) => {
                    const isRangeStart = d === 6 && i === 11
                    const isRangeEnd = d === 13 && i === 18
                    const inRange = i >= 11 && i <= 18
                    return (
                      <div
                        key={i}
                        className={`h-7 w-7 mx-auto flex items-center justify-center rounded-full text-xs transition-colors ${
                          isRangeStart || isRangeEnd
                            ? "bg-[#7F56D9] text-white font-semibold"
                            : inRange
                            ? "bg-[#F4EBFF] text-[#7F56D9]"
                            : d === 24
                            ? "bg-[#F2F4F7] font-semibold text-[#101828]"
                            : "text-[#344054] hover:bg-[#F2F4F7]"
                        }`}
                      >
                        {d}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Month 2: Feb 2027 */}
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-[#101828]">
                  <ChevronLeft className="h-4 w-4 text-[#667085] cursor-pointer" />
                  <span>February 2027</span>
                  <ChevronRight className="h-4 w-4 text-[#667085] cursor-pointer" />
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-[#667085] font-medium mb-1">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sat", "Su"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {febDays.flat().map((d, i) => (
                    <div
                      key={i}
                      className="h-7 w-7 mx-auto flex items-center justify-center rounded-full text-xs text-[#344054] hover:bg-[#F2F4F7]"
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Range Inputs & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 mt-5 border-t border-[#EAECF0]">
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 w-28 px-2.5 rounded-lg border border-[#D0D5DD] text-center font-medium text-[#344054] bg-white"
                />
                <span className="text-[#667085]">–</span>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 w-28 px-2.5 rounded-lg border border-[#D0D5DD] text-center font-medium text-[#344054] bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <ModalButton variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </ModalButton>
                <ModalButton variant="primary" onClick={() => onOpenChange(false)}>
                  Apply
                </ModalButton>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}
