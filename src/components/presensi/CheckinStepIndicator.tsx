type Props = {
  current: number;
};

export default function CheckinStepIndicator({ current }: Props) {
  const steps = ["Scan QR Code", "Identitas", "Selesai"];

  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {steps.map((label, index) => {
        const number = index + 1;
        const active = number <= current;

        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold",
                active ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-400",
              ].join(" ")}
            >
              {number}
            </span>

            <span
              className={[
                "hidden text-[10px] sm:block",
                active ? "font-medium text-gray-700" : "text-gray-400",
              ].join(" ")}
            >
              {label}
            </span>

            {index < steps.length - 1 && (
              <span
                className={[
                  "h-px w-5",
                  number < current ? "bg-teal-600" : "bg-gray-200",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
