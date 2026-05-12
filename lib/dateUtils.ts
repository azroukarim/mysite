export function parseSaleDate(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  
  // 1. If it's a numeric timestamp string
  if (/^\d+$/.test(dateStr)) {
    return parseInt(dateStr);
  }

  // 2. If it's a full ISO string (contains both T and colon), preserve its exact time
  if (dateStr.includes('T') && dateStr.includes(':')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // 3. Otherwise, treat as a date (YYYY-MM-DD) and set to end of day in GMT+1
  const datePart = dateStr.split('T')[0].split(' ')[0];
  
  // Per user request: Use GMT+1 (Morocco) timezone
  // Date-based sales end at the END of that day (23:59:59) in GMT+1
  const targetDate = new Date(`${datePart}T23:59:59+01:00`);
  
  if (isNaN(targetDate.getTime())) return null;
  
  return targetDate.getTime();
}

/**
 * Formats a date or timestamp to YYYY-MM-DD string in GMT+1 timezone
 */
export function formatToGMTPlus1Date(date: Date | number | string): string {
  if (!date) return '';
  
  let d: Date;
  if (typeof date === 'string') {
    if (/^\d+$/.test(date)) {
      d = new Date(parseInt(date));
    } else {
      d = new Date(date);
    }
  } else if (typeof date === 'number') {
    d = new Date(date);
  } else {
    d = date;
  }

  if (isNaN(d.getTime())) return '';

  // Shift by 1 hour to ensure toISOString() returns the correct date for GMT+1
  // This is a simple way to get the YYYY-MM-DD part for a specific offset
  const shifted = new Date(d.getTime() + (1 * 60 * 60 * 1000));
  return shifted.toISOString().split('T')[0];
}
