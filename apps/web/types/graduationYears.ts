// Generate graduation years dynamically based on current year
// Shows current year + next 4 years (e.g., if 2025, shows 2025-2029)
export function getGraduationYears(): number[] {
  const currentYear = new Date().getFullYear()
  const years: number[] = []

  for (let i = 0; i < 7; i++) {
    years.push(currentYear + i)
  }

  return years
}

// Get graduation year options for select dropdowns
export function getGraduationYearOptions() {
  return getGraduationYears().map((year) => ({
    value: String(year),
    label: String(year),
  }))
}

// Validate if a year is within the acceptable range
export function isValidGraduationYear(year: number): boolean {
  const validYears = getGraduationYears()
  return validYears.includes(year)
}
