
export let holidays: { date: string; name: string }[] = [
    { date: "2025-08-27", name: "Ganesh Chaturthi" },
];

export function addHoliday(holiday: { date: string; name: string }) {
    const index = holidays.findIndex(h => h.date === holiday.date);
    if (index > -1) {
        holidays[index] = holiday;
    } else {
        holidays.push(holiday);
    }
    holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function removeHoliday(date: string) {
    holidays = holidays.filter(h => h.date !== date);
}
