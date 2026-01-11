export function convertToInputValues(dateStr: string, timeStr: string) {
  // dateStr: "31 Jan 2026"
  // timeStr: "06:50 pm"

  const [day, monthStr, year] = dateStr.split(" ");

  const monthMap: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  let [hours, minutes] = timeStr.split(" ")[0].split(":").map(Number);
  const meridiem = timeStr.split(" ")[1].toLowerCase();

  if (meridiem === "pm" && hours !== 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;

  const date = `${year}-${monthMap[monthStr]}-${day.padStart(2, "0")}`;
  const time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;

  return { date, time };
}
