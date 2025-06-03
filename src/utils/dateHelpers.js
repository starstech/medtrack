import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import isTomorrow from 'dayjs/plugin/isTomorrow'

// Extend dayjs with plugins
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.extend(isTomorrow)

/**
 * Format a date relative to now (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (date) => {
  return dayjs(date).fromNow()
}

/**
 * Format a date to a human-readable string
 */
export const formatDate = (date, format = 'MMM D, YYYY') => {
  return dayjs(date).format(format)
}

/**
 * Format a time to a human-readable string
 */
export const formatTime = (date, format = 'h:mm A') => {
  return dayjs(date).format(format)
}

/**
 * Format a date and time together
 */
export const formatDateTime = (date, format = 'MMM D, YYYY h:mm A') => {
  return dayjs(date).format(format)
}

/**
 * Get age from date of birth
 */
export const getAge = (dateOfBirth) => {
  const today = dayjs()
  const birth = dayjs(dateOfBirth)
  let age = today.year() - birth.year()
  
  // Check if birthday hasn't occurred this year
  if (today.month() < birth.month() || 
      (today.month() === birth.month() && today.date() < birth.date())) {
    age--
  }
  
  return age
}

/**
 * Check if a date is today
 */
export const isToday = (date) => {
  return dayjs(date).isToday()
}

/**
 * Check if a date is yesterday
 */
export const isYesterday = (date) => {
  return dayjs(date).isYesterday()
}

/**
 * Check if a date is tomorrow
 */
export const isTomorrow = (date) => {
  return dayjs(date).isTomorrow()
}

/**
 * Check if a date is in the past
 */
export const isPast = (date) => {
  return dayjs(date).isBefore(dayjs())
}

/**
 * Check if a date is in the future
 */
export const isFuture = (date) => {
  return dayjs(date).isAfter(dayjs())
}

/**
 * Check if a date is overdue (past the current time)
 */
export const isOverdue = (date) => {
  return dayjs(date).isBefore(dayjs())
}

/**
 * Get the start of today
 */
export const getStartOfToday = () => {
  return dayjs().startOf('day')
}

/**
 * Get the end of today
 */
export const getEndOfToday = () => {
  return dayjs().endOf('day')
}

/**
 * Get the start of the week
 */
export const getStartOfWeek = (date = dayjs()) => {
  return dayjs(date).startOf('week')
}

/**
 * Get the end of the week
 */
export const getEndOfWeek = (date = dayjs()) => {
  return dayjs(date).endOf('week')
}

/**
 * Get the start of the month
 */
export const getStartOfMonth = (date = dayjs()) => {
  return dayjs(date).startOf('month')
}

/**
 * Get the end of the month
 */
export const getEndOfMonth = (date = dayjs()) => {
  return dayjs(date).endOf('month')
}

/**
 * Get days between two dates
 */
export const getDaysBetween = (startDate, endDate) => {
  return dayjs(endDate).diff(dayjs(startDate), 'days')
}

/**
 * Get hours between two dates
 */
export const getHoursBetween = (startDate, endDate) => {
  return dayjs(endDate).diff(dayjs(startDate), 'hours')
}

/**
 * Get minutes between two dates
 */
export const getMinutesBetween = (startDate, endDate) => {
  return dayjs(endDate).diff(dayjs(startDate), 'minutes')
}

/**
 * Add time to a date
 */
export const addTime = (date, amount, unit) => {
  return dayjs(date).add(amount, unit)
}

/**
 * Subtract time from a date
 */
export const subtractTime = (date, amount, unit) => {
  return dayjs(date).subtract(amount, unit)
}

/**
 * Format duration in a human-readable way
 */
export const formatDuration = (minutes) => {
  const duration = dayjs.duration(minutes, 'minutes')
  
  if (minutes < 60) {
    return `${minutes} min`
  } else if (minutes < 1440) { // Less than a day
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    }
    return `${hours}h ${remainingMinutes}m`
  } else { // Days
    const days = Math.floor(minutes / 1440)
    const remainingHours = Math.floor((minutes % 1440) / 60)
    if (remainingHours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`
    }
    return `${days}d ${remainingHours}h`
  }
}

/**
 * Get a smart date label (Today, Yesterday, Tomorrow, or formatted date)
 */
export const getSmartDateLabel = (date) => {
  const dateObj = dayjs(date)
  
  if (dateObj.isToday()) {
    return 'Today'
  } else if (dateObj.isYesterday()) {
    return 'Yesterday'
  } else if (dateObj.isTomorrow()) {
    return 'Tomorrow'
  } else if (dateObj.year() === dayjs().year()) {
    return dateObj.format('MMM D')
  } else {
    return dateObj.format('MMM D, YYYY')
  }
}

/**
 * Get time until a future date
 */
export const getTimeUntil = (date) => {
  const now = dayjs()
  const target = dayjs(date)
  
  if (target.isBefore(now)) {
    return null // Date is in the past
  }
  
  const diffMinutes = target.diff(now, 'minutes')
  
  if (diffMinutes < 1) {
    return 'now'
  } else if (diffMinutes < 60) {
    return `in ${diffMinutes} min`
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    if (minutes === 0) {
      return `in ${hours} hour${hours !== 1 ? 's' : ''}`
    }
    return `in ${hours}h ${minutes}m`
  } else {
    const days = Math.floor(diffMinutes / 1440)
    return `in ${days} day${days !== 1 ? 's' : ''}`
  }
}

/**
 * Check if two dates are on the same day
 */
export const isSameDay = (date1, date2) => {
  return dayjs(date1).isSame(dayjs(date2), 'day')
}

/**
 * Check if a date is within a range
 */
export const isDateInRange = (date, startDate, endDate) => {
  const dateObj = dayjs(date)
  return dateObj.isSameOrAfter(dayjs(startDate)) && 
         dateObj.isSameOrBefore(dayjs(endDate))
}

/**
 * Get all dates in a date range
 */
export const getDatesInRange = (startDate, endDate) => {
  const dates = []
  let currentDate = dayjs(startDate)
  const end = dayjs(endDate)
  
  while (currentDate.isSameOrBefore(end)) {
    dates.push(currentDate.toDate())
    currentDate = currentDate.add(1, 'day')
  }
  
  return dates
}

/**
 * Format medication frequency for display
 */
export const formatMedicationFrequency = (frequency) => {
  const frequencyMap = {
    'once_daily': 'Once daily',
    'twice_daily': 'Twice daily',
    'three_times_daily': 'Three times daily',
    'four_times_daily': 'Four times daily',
    'as_needed': 'As needed',
    'weekly': 'Weekly',
    'monthly': 'Monthly'
  }
  
  return frequencyMap[frequency] || frequency
}

/**
 * Get next dose time based on frequency
 */
export const getNextDoseTime = (lastDoseTime, frequency) => {
  const lastDose = dayjs(lastDoseTime)
  
  switch (frequency) {
    case 'once_daily':
      return lastDose.add(1, 'day')
    case 'twice_daily':
      return lastDose.add(12, 'hours')
    case 'three_times_daily':
      return lastDose.add(8, 'hours')
    case 'four_times_daily':
      return lastDose.add(6, 'hours')
    case 'weekly':
      return lastDose.add(1, 'week')
    case 'monthly':
      return lastDose.add(1, 'month')
    default:
      return null // For as_needed
  }
}

/**
 * Check if it's time for a notification reminder
 */
export const shouldSendReminder = (scheduledTime, reminderMinutes) => {
  const now = dayjs()
  const scheduled = dayjs(scheduledTime)
  const reminderTime = scheduled.subtract(reminderMinutes, 'minutes')
  
  return now.isSameOrAfter(reminderTime) && now.isBefore(scheduled)
}