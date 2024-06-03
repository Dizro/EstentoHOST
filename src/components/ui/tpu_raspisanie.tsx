import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const timeSlots = [
  { time: "08:30 - 10:05", color: "bg-red-500" },
  { time: "10:25 - 12:00", color: "bg-orange-500" },
  { time: "12:40 - 14:15", color: "bg-yellow-500" },
  { time: "14:35 - 16:00", color: "bg-green-500" },
  { time: "16:30 - 10:05", color: "bg-blue-500" },
];

const schedule = [
  {
    timeIndex: 0,
    subject: "Математика (ЛК)",
    teacher: "Преподаватель",
    location: "ГК, ауд. 209",
  },
  {
    timeIndex: 1,
    subject: "ИЯ (английский) (ПР)",
    teacher: "Преподаватель",
    location: "10, ауд. 201/3",
  },
  {
    timeIndex: 2,
    subject: "Мат.логик,т.алгоритм (ЛК)",
    teacher: "Преподаватель",
    location: "19, ауд. 139",
  },
  {
    timeIndex: 3,
    subject: "НГ и ИГ (ПР)",
    teacher: "Преподаватель",
    location: "10, ауд. 418",
  },
  {
    timeIndex: 4,
    subject: "Программирование (ЛБ)",
    teacher: "Преподаватель",
    location: "10, ауд. 402",
  },
];

export default function RaspisanieTPU() {
  return (
    <div className="w-full max-w-lg mx-auto p-4" style={{ backgroundColor: '#F3F4F6' }}>
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
          <CardTitle className="text-xl font-bold">Расписание на сегодня</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-4">
          {timeSlots.map((slot, index) => (
            <div key={index} className="grid gap-2">
              {schedule
                .filter((item) => item.timeIndex === index)
                .map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Badge variant="secondary" className={`${slot.color} text-white`}>{slot.time}</Badge>
                      <p className="font-medium text-gray-800">{item.subject}</p>
                      <Badge variant="secondary" className="bg-gray-200 text-gray-800">{item.teacher}</Badge>
                      <Badge variant="secondary" className="bg-gray-200 text-gray-800">{item.location}</Badge>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
