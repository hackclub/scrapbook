export function postLimit(value) {
  const limit = Number(value)
  return Number.isFinite(limit) && limit > 0
    ? Math.max(1, Math.min(Math.floor(limit), 300))
    : 200
}
