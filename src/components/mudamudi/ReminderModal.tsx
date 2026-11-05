
"use client";

type ReminderModalProps = {
    title: string;
    description: string;
    count?: number;
    countLabel?: string;
    note?: string;
    buttonLabel?: string;
    onClose: () => void;
};

export default function ReminderModal({
    title,
    description,
    count,
    countLabel,
    note,
    buttonLabel = "Mengerti",
    onClose,
}: ReminderModalProps) {
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="reminder-modal-title"
                className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl"
            >
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px]">
                    <div className="flex gap-4 p-5 sm:p-7">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3CD] text-[#B7791F] sm:h-11 sm:w-11">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8v4m0 4h.01M10.3 3.86 1.82 18.14A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-2.86L13.7 3.86a2 2 0 0 0-3.4 0Z"
                                />
                            </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#B7791F]">
                                Pengingat
                            </p>

                            <h2
                                id="reminder-modal-title"
                                className="text-sm font-bold tracking-tight text-[#29261F] sm:text-base"
                            >
                                {title}
                            </h2>

                            <p className="mt-2 text-[11px] leading-5 text-[#6F6859] sm:text-xs">
                                {description}
                            </p>

                            {note && (
                                <p className="mt-3 border-t border-[#F1E8D1] pt-3 text-[10px] leading-4 text-[#8A806C]">
                                    {note}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-4 border-t border-[#F1E8D1] bg-[#FFFCF4] p-5 sm:border-l sm:border-t-0 sm:p-6">
                        {typeof count === "number" ? (
                            <div className="rounded-xl border border-[#F3DEA0] bg-[#FFF7DE] p-3">
                                <p className="text-[9px] font-semibold uppercase tracking-wide text-[#92702F]">
                                    Perlu dilengkapi
                                </p>

                                <p className="mt-1 text-3xl font-bold tabular-nums text-[#A66B12]">
                                    {count}
                                </p>

                                {countLabel && (
                                    <p className="mt-1 text-[10px] leading-4 text-[#76633F]">
                                        {countLabel}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div />
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-lg bg-[#D69E28] px-4 py-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#B98219] active:bg-[#966714] sm:text-xs"
                        >
                            {buttonLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
