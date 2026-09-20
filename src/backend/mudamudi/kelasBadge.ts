export function getKelasBadgeClass(kelas: string): string {
  switch (kelas) {
    case "PAUD":
      return "border-pink-200 bg-pink-50 text-pink-600";

    case "Caberawit":
      return "border-amber-200 bg-amber-50 text-amber-600";

    case "Pra Remaja":
      return "border-blue-200 bg-blue-50 text-blue-600";

    case "Remaja":
      return "border-teal-200 bg-teal-50 text-teal-600";

    case "Usia Nikah":
      return "border-orange-200 bg-orange-50 text-orange-600";

    default:
      return "border-gray-200 bg-gray-50 text-gray-500";
  }
}
