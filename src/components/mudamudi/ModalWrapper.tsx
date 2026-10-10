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
    lg: "max-w-xl",
    xl: "max-w-5xl",
  }[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-4 backdrop-blur-sm sm:px-6"
      onClick={onClose}
    >
      <div
        className={`my-auto flex max-h-[calc(100dvh-2rem)] w-full min-w-0 flex-col ${sizeClass} overflow-hidden rounded-xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
