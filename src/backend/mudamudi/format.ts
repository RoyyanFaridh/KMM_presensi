export function toTitleCase(str: string): string {
  return str
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function getInitials(nama: string): string {
  return toTitleCase(nama)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

const AVATAR_COLORS = [
  { bg: '#fb923c', ring: 'ring-orange-100' },
  { bg: '#2dd4bf', ring: 'ring-teal-100' },
  { bg: '#60a5fa', ring: 'ring-blue-100' },
  { bg: '#a78bfa', ring: 'ring-violet-100' },
  { bg: '#f472b6', ring: 'ring-pink-100' },
  { bg: '#34d399', ring: 'ring-emerald-100' },
  { bg: '#fbbf24', ring: 'ring-amber-100' },
  { bg: '#818cf8', ring: 'ring-indigo-100' },
]

export function getAvatarColor(nama: string): { bg: string; ring: string } {
  let hash = 0
  for (let i = 0; i < nama.length; i++) {
    hash = nama.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}