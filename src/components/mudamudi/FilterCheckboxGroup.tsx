type Props = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  colorClass?: string;
};

export default function FilterCheckboxGroup({
  label,
  options,
  selected,
  onChange,
  colorClass = "border-[#65B98A] bg-[#E6F2EA] text-[#206440]",
}: Props) {
  const isSemua = selected.length === 0;

  function toggleOption(opt: string) {
    if (selected.includes(opt)) {
      onChange(selected.filter((o) => o !== opt));
    } else {
      onChange([...selected, opt]);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium text-[#202824]">{label}</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([])}
          className={`rounded-xl border px-3 py-1.5 text-[11px] font-medium transition ${
            isSemua
              ? colorClass
              : "border-[#E5EAE6] text-[#78827C] hover:bg-[#F5F7F5]"
          }`}
        >
          Semua
        </button>

        {options.map((option) => {
          const isSelected = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              aria-pressed={isSelected}
              className={`rounded-xl border px-3 py-1.5 text-[11px] font-medium transition ${
                isSelected
                  ? colorClass
                  : "border-[#E5EAE6] text-[#78827C] hover:bg-[#F5F7F5]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
