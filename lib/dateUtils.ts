export function parseSaleDate(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  
  // If it's a timestamp (numeric string), return it directly as a number
  if (/^\d+$/.test(dateStr)) {
    return parseInt(dateStr);
  }

  // Extract just the date part (YYYY-MM-DD)
  const datePart = dateStr.split('T')[0].split(' ')[0];
  
  // Per user request: Date-based sales end at 00:00:00 of that day
  const targetDate = new Date(`${datePart}T00:00:00`);
  
  if (isNaN(targetDate.getTime())) return null;
  
  return targetDate.getTime();
}
