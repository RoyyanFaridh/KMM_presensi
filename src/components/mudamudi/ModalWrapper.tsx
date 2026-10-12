type Props = {
  children: React.ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
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
  }[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-3 py-3 backdrop-blur-sm sm:px-6 sm:py-4"
      onClick={onClose}
    >
      <div
        className={`my-auto flex max-h-[calc(100dvh-1.5rem)] w-full min-w-0 flex-col ${sizeClass} overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
