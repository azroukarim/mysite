export function parseSaleDate(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  
  // If it's a timestamp (numeric string), return it directly as a number
  if (/^\d+$/.test(dateStr)) {
    return parseInt(dateStr);
  }

  // Extract just the date part (YYYY-MM-DD)
  const datePart = dateStr.split('T')[0].split(' ')[0];
  
  // Per user request: Date-based sales end at the END of that day (23:59:59)
  // This ensures that if you pick "Today", the sale is active until midnight.
  const targetDate = new Date(`${datePart}T23:59:59`);
  
  if (isNaN(targetDate.getTime())) return null;
  
  return targetDate.getTime();
}
