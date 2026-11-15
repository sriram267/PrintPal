import { useEffect, useRef, useState } from "react";
import { ClerkWaitlist } from "./ClerkWaitlist";
import { IconX } from "./Hero/icons";
import "./waitlist.css";

const EVENT = "printpal:open-waitlist";

/** Opens the waitlist dialog from anywhere (nav, hero, footer). */
export function openWaitlist() {
  window.dispatchEvent(new Event(EVENT));
}

/** A dialog that shows Clerk's <Waitlist /> component. */
export function WaitlistDialog() {
  const ref = useRef<HTMLDialogElement | null>(null);
  // mount Clerk's form only once the dialog has been opened, so the page doesn't load it up front
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const open = () => {
      const d = ref.current;
      if (!d || d.open) return;
      setOpened(true);
      d.showModal();
      window.setTimeout(() => d.querySelector<HTMLInputElement>("input")?.focus(), 250);
    };
    window.addEventListener(EVENT, open);
    return () => window.removeEventListener(EVENT, open);
  }, []);

  return (
    <dialog
      ref={ref}
      className="wl-dialog"
      aria-label="Join the PrintPal waitlist"
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="wl-body">
        <button type="button" className="wl-close" aria-label="Close" onClick={() => ref.current?.close()}>
          <IconX size={16} />
        </button>
        {opened && <ClerkWaitlist />}
      </div>
    </dialog>
  );
}
