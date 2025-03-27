<template>
  <div class="calendar-view">
    <FullCalendar :options="calendarOptions" ref="calendar" />
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  defineEmits,
  defineProps,
  defineExpose,
} from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const props = defineProps({
  doctor: {
    type: Object,
    required: true,
  },
  bookedSlots: {
    type: Array,
    required: true,
  },
  initialView: {
    type: String,
    default: "timeGridWeek",
  },
  options: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["slotSelected"]);

const calendar = ref(null);

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateCalendarEvents(start, end) {
  if (!props.doctor) return [];

  const events = [];
  const currentDate = new Date();

  const availableDays = props.doctor.availability.reduce((acc, day) => {
    acc[day.day] = day.hours;
    return acc;
  }, {});

  let current = new Date(start);
  while (current <= end) {
    const dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(current);
    if (availableDays[dayName]) {
      const hours = availableDays[dayName];
      hours.forEach((time) => {
        const [hours, minutes, period] = time
          .match(/(\d+):(\d+) (AM|PM)/)
          .slice(1);
        let hour = parseInt(hours, 10);
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;

        const slotDate = new Date(current);
        slotDate.setHours(hour, parseInt(minutes, 10), 0, 0);

        // Check if the slot is in the past
        const isPast = slotDate < currentDate;

        // Check if the slot is today and the time has passed
        const isToday = formatDate(slotDate) === formatDate(currentDate);
        const isTimePassed = isToday && isPast;

        // Check if the slot is too close (within 15 minutes)
        let isTooClose = false;
        if (!isPast) {
          const timeDiff = (slotDate - currentDate) / (1000 * 60); // Difference in minutes
          isTooClose = timeDiff < 15;
        }

        // Check if the slot is booked
        const slotDateStr = formatDate(slotDate);
        const isBooked = props.bookedSlots.some(
          (b) => b.date === slotDateStr && b.day === dayName && b.time === time
        );

        // Determine the slot's status
        let status = "available";
        let label = "Available";
        if (isPast) {
          status = "past";
          label = "Past";
        } else if (isTooClose) {
          status = "too-close";
          label = "Too Close";
        } else if (isBooked) {
          status = "booked";
          label = "Booked";
        }

        // Skip slots for today if the time has passed
        if (isTimePassed) {
          return;
        }

        events.push({
          title: label,
          start: slotDate,
          end: new Date(slotDate.getTime() + 30 * 60 * 1000),
          extendedProps: { day: dayName, time: time, status, slotDate },
          classNames: [status + "-slot"],
        });
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return events;
}

function handleEventClick(info) {
  const { day, time, status, slotDate } = info.event.extendedProps;
  if (status === "available") {
    emit("slotSelected", { day, time, slotDate });
  }
}

const calendarOptions = computed(() => {
  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: props.initialView,
    initialDate: "2025-03-24",
    headerToolbar: {
      left: "",
      center: "title",
      right: "",
    },
    titleFormat: {
      month: "short",
      day: "numeric",
      year: "numeric",
      separator: " - ",
    },
    events: (fetchInfo, successCallback) => {
      const events = generateCalendarEvents(fetchInfo.start, fetchInfo.end);
      successCallback(events);
    },
    eventClick: handleEventClick,
    slotMinTime: "07:00:00",
    slotMaxTime: "18:00:00",
    slotDuration: "00:30:00",
    allDaySlot: false,
    height: "auto",
    validRange: {
      start: "2025-03-27",
      end: "2025-04-28",
    },
    nowIndicator: true,
    eventContent: (arg) => {
      return {
        html: `
          <div class="slot-content">
            <div class="slot-time">${arg.event.extendedProps.time}</div>
            <div class="slot-status">${arg.event.title}</div>
          </div>
        `,
      };
    },
    ...props.options,
  };
});

// Add a method to expose calendar API
function getApi() {
  return calendar.value?.getApi();
}

defineExpose({
  getApi,
});

watch(
  () => props.bookedSlots,
  () => {
    if (calendar.value) {
      const calendarApi = calendar.value.getApi();
      calendarApi.refetchEvents();
    }
  },
  { deep: true }
);

watch(
  () => props.initialView,
  (newView) => {
    if (calendar.value) {
      const calendarApi = calendar.value.getApi();
      calendarApi.changeView(newView);
    }
  }
);
</script>

<style scoped>
.calendar-view {
  margin-top: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

:deep(.fc) {
  font-family: "Inter", sans-serif;
  --fc-border-color: #e5e7eb;
  --fc-today-bg-color: #f0fdfa;
  --fc-page-bg-color: white;
}

:deep(.fc .fc-col-header-cell) {
  background: #f9fafb;
  color: #4b5563;
  padding: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

:deep(.fc .fc-timegrid-slot) {
  height: 48px !important;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.fc-event) {
  border: none !important;
  background: transparent !important;
  margin: 0 !important;
  padding: 2px !important;
}

:deep(.fc-event-main) {
  margin: 1px;
  padding: 4px 8px;
  border-radius: 4px;
  min-height: 40px;
}

:deep(.slot-content) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.slot-time) {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1f2937;
}

:deep(.slot-status) {
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

:deep(.available-slot) {
  cursor: pointer;
}

:deep(.available-slot .fc-event-main) {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
}

:deep(.available-slot .slot-status) {
  color: #059669;
}

:deep(.available-slot:hover .fc-event-main) {
  background: #dcfce7;
  transform: translateY(-1px);
  transition: all 0.2s;
}

:deep(.booked-slot .fc-event-main) {
  background: #fef2f2;
  border: 1px solid #fee2e2;
}

:deep(.booked-slot .slot-status) {
  color: #dc2626;
}

:deep(.past-slot .fc-event-main) {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

:deep(.past-slot .slot-status) {
  color: #6b7280;
}

:deep(.too-close-slot .fc-event-main) {
  background: #fffbeb;
  border: 1px solid #fef3c7;
}

:deep(.too-close-slot .slot-status) {
  color: #d97706;
}

:deep(.fc-timegrid-col.fc-day-today) {
  background-color: #fffbeb !important;
}

:deep(.fc-timegrid-col) {
  background: white;
}

:deep(.fc-timegrid-slot-label) {
  font-size: 0.75rem;
  color: #6b7280;
  padding-right: 1rem;
  text-transform: uppercase;
  font-weight: 500;
}

:deep(.fc-toolbar) {
  display: none !important;
}

:deep(.fc-view) {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.fc-scrollgrid) {
  border: none !important;
}

:deep(.fc-scrollgrid td:last-of-type) {
  border-right: none !important;
}

:deep(.fc-scrollgrid-section-header td) {
  border-right: none !important;
}
</style> 