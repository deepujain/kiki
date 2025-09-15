
import type { Employee } from "@/lib/types";

export let employees: Employee[] = [
  {
    id: "1",
    name: "Sathish",
    role: "TSE",
    phone: "555-0101",
    gender: "Male",
    experience: 3,
    avatarUrl: "https://picsum.photos/seed/sathish/100/100",
    birthday: "1990-09-15",
    employed: true,
  },
  {
    id: "2",
    name: "Raghavendra",
    role: "TSE",
    phone: "555-0102",
    gender: "Male",
    experience: 5,
    avatarUrl: "https://picsum.photos/seed/raghavendra/100/100",
    birthday: "1988-08-25",
    employed: true,
  },
  {
    id: "3",
    name: "Safee",
    role: "TSE",
    phone: "555-0103",
    gender: "Male",
    experience: 4,
    avatarUrl: "https://picsum.photos/seed/safee/100/100",
    birthday: "1992-03-10",
    employed: true,
  },
  {
    id: "4",
    name: "Dhiren",
    role: "MIS",
    phone: "555-0104",
    gender: "Male",
    experience: 8,
    avatarUrl: "https://picsum.photos/seed/dhiren/100/100",
    birthday: "1985-09-05",
    employed: true,
  },
  {
    id: "5",
    name: "Arjun",
    role: "Logistics",
    phone: "555-0105",
    gender: "Male",
    experience: 2,
    avatarUrl: "https://picsum.photos/seed/arjun/100/100",
    birthday: "1995-12-20",
    employed: true,
  },
  {
    id: "6",
    name: "Aman",
    role: "Logistics",
    phone: "555-0106",
    gender: "Male",
    experience: 6,
    avatarUrl: "https://picsum.photos/seed/aman/100/100",
    birthday: "1991-09-28",
    employed: true,
  },
  {
    id: "7",
    name: "Madhu",
    role: "TSE",
    phone: "555-0107",
    gender: "Male",
    experience: 4,
    avatarUrl: "https://picsum.photos/seed/madhu/100/100",
    birthday: "1993-07-18",
    employed: false,
  },
  {
    id: "8",
    name: "Neetha Jain",
    role: "Founder & CEO",
    phone: "555-0108",
    gender: "Female",
    experience: 5,
    avatarUrl: "https://picsum.photos/seed/neethajain/100/100",
    birthday: "2000-07-31",
    employed: true,
  }
];

export function updateEmployeeDetails(updatedEmployee: Employee) {
    const index = employees.findIndex(emp => emp.id === updatedEmployee.id);
    if (index !== -1) {
        employees[index] = updatedEmployee;
    }
}
