export function calculatePeriod(hour: number) {
  const isMorning = hour >= 9 && hour < 12;
  const isAfternoon = hour >= 13 && hour < 18;
  const isEvening = hour >= 19 && hour < 21;

  return {
    isMorning,
    isAfternoon,
    isEvening,
  };
}