
type Props = {
  children: React.ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
};

export default function ModalWrapper({
  children,
  onClose,
  size = "md",
}: Props) {
  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    "2xl": "max-w-[1440px]",
  }[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-3 py-3 backdrop-blur-sm sm:px-6 sm:py-4"
      onClick={onClose}
    >
      <div
        className={`my-auto flex max-h-[calc(100dvh-1.5rem)] w-full min-w-0 flex-col ${sizeClass} overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
