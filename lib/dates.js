export const dt = d => new Date(d).toLocaleDateString()

const year = new Date().getFullYear()
export const tinyDt = d =>
  dt(d)
    .replace(`/${year}`, '')
    .replace(`${year}-`, '')

// based on https://github.com/withspectrum/spectrum/blob/alpha/src/helpers/utils.js#L146
export const timeSince = (
  previous,
  absoluteDuration = false,
  longForm = true,
  current = new Date().toISOString()
) => {
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerWeek = msPerDay * 7
  const msPerMonth = msPerDay * 30 * 2
  const msPerYear = msPerDay * 365

  const future = new Date(previous) - new Date(current)
  const past = new Date(current) - new Date(previous)
  const elapsed = [future, past].sort()[1]

  let humanizedTime
  if (elapsed < msPerMinute) {
    humanizedTime = '< 1m'
  } else if (elapsed < msPerHour) {
    const now = Math.round(elapsed / msPerMinute)
    humanizedTime = longForm ? `${now} minute${now > 1 ? 's' : ''}` : `${now}m`
  } else if (elapsed < msPerDay) {
    const now = Math.round(elapsed / msPerHour)
    humanizedTime = longForm ? `${now} hour${now > 1 ? 's' : ''}` : `${now}h`
  } else if (elapsed < msPerWeek) {
    const now = Math.round(elapsed / msPerDay)
    humanizedTime = longForm ? `${now} day${now > 1 ? 's' : ''}` : `${now}d`
  } else if (elapsed < msPerMonth) {
    const now = Math.round(elapsed / msPerWeek)
    humanizedTime = longForm ? `${now} week${now > 1 ? 's' : ''}` : `${now}w`
  } else if (elapsed < msPerYear) {
    const now = Math.round(elapsed / msPerMonth)
    humanizedTime = longForm ? `${now} month${now > 1 ? 's' : ''}` : `${now}mo`
  } else {
    const now = Math.round(elapsed / msPerYear)
    humanizedTime = longForm ? `${now} year${now > 1 ? 's' : ''}` : `${now}y`
  }

  if (absoluteDuration) {
    return humanizedTime
  } else {
    return elapsed > 0 ? `${humanizedTime} ago` : `in ${humanizedTime}`
  }
}

function formatChunk(variant, date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = [
    'January',
    'Febuary',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  switch (variant) {
    case 'dddd':
      return days[date.getDay()]
    case 'ddd':
      return formatChunk('dddd', date).slice(0, 3)
    case 'dd':
      return ('00' + formatChunk('d', date)).slice(-2)
    case 'd':
      return date.getDate()
    case 'mmmm':
      return months[date.getMonth()]
    case 'mmm':
      return formatChunk('mmmm', date).slice(0, 3)
    case 'mm':
      return ('00' + formatChunk('m', date)).slice(-2)
    case 'm':
      return (date.getMonth() + 1).toString()
    case 'yyyy':
      return date.getFullYear().toString()
    case 'yy':
      return formatChunk('yyyy', date).slice(-2)
    default:
      return null
  }
}
export const formatDate = (date, format = 'dddd mmm d', divider = ' ') =>
  format
    .split(divider)
    .map(chunk => formatChunk(chunk, new Date(date)) + (chunk === 'dddd' ? ',' : ''))
    .join(divider)
