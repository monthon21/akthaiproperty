"use client";

interface SavingModalProps {
  /** "saving" shows the spinner, "success" shows the checkmark, null hides the modal */
  status: "saving" | "success" | null;
  savingTitle?: string;
  savingText?: string;
  successTitle?: string;
  successText?: string;
}

export default function SavingModal({
  status,
  savingTitle = "กำลังบันทึกข้อมูล...",
  savingText = "กรุณารอสักครู่ อย่าปิดหรือรีเฟรชหน้านี้",
  successTitle = "บันทึกสำเร็จ!",
  successText = "ระบบกำลังนำทางคุณไปยังหน้าทรัพย์สิน...",
}: SavingModalProps) {
  if (!status) return null;
  const isSaving = status === "saving";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      aria-busy={isSaving}
    >
      <div className="w-full max-w-sm bg-[#112240] border border-white/10 rounded-2xl p-8 shadow-2xl text-center text-white">
        <div className="relative w-20 h-20 mx-auto mb-6">
          {isSaving ? (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="absolute inset-0 m-auto w-8 h-8 text-accent animate-pulse"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </>
          ) : (
            <div className="absolute inset-0 rounded-full bg-accent/15 border-4 border-accent flex items-center justify-center animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
          )}
        </div>

        <p className="text-base font-black tracking-wide">{isSaving ? savingTitle : successTitle}</p>
        <p className="text-xs text-white/60 mt-2">{isSaving ? savingText : successText}</p>

        {isSaving && (
          <div className="flex justify-center gap-1.5 mt-5">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="w-2 h-2 rounded-full bg-accent animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
