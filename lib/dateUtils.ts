export function parseSaleDate(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  
  // Extract just the date part (YYYY-MM-DD) regardless of whether it has a time component
  const datePart = dateStr.split('T')[0].split(' ')[0];
  
  // Set to 23:59:59 of that day
  const targetDate = new Date(`${datePart}T23:59:59`);
  
  // Check if date is valid
  if (isNaN(targetDate.getTime())) return null;
  
  return targetDate.getTime();
}
