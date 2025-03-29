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
import store from "../store";
import { generateCalendarEvents } from "../utils/utils";

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

const emit = defineEmits(["slotSelected", "bookingSelected"]);

const calendar = ref(null);

function handleEventClick(info) {
  const { day, time, status, slotDate, bookingId } = info.event.extendedProps;
  if (status === "available") {
    emit("slotSelected", { day, time, slotDate });
  } else if (status === "booked-by-user" && bookingId) {
    emit("bookingSelected", { bookingId, day, time, slotDate });
  }
}

const calendarOptions = computed(() => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const oneMonthLater = new Date(today);
  oneMonthLater.setMonth(today.getMonth() + 1);
  const oneMonthLaterStr = oneMonthLater.toISOString().split("T")[0];

  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: props.initialView,
    initialDate: todayStr,
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
      const events = generateCalendarEvents(fetchInfo.start, fetchInfo.end, {
        doctor: props.doctor,
        bookedSlots: props.bookedSlots,
        currentUserId: store.getters.user.id,
        currentDate: new Date(),
        getDoctorById: store.getters.getDoctorById,
      });
      successCallback(events);
    },
    eventClick: handleEventClick,
    slotMinTime: "07:00:00",
    slotMaxTime: "18:00:00",
    slotDuration: "00:30:00",
    allDaySlot: false,
    height: "auto",
    validRange: {
      start: todayStr,
      end: oneMonthLaterStr,
    },
    nowIndicator: true,
    eventDidMount: (info) => {
      if (info.event.extendedProps.tooltip) {
        info.el.setAttribute("data-tooltip", info.event.extendedProps.tooltip);
      }
    },
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

function getApi() {
  return calendar.value?.getApi();
}

defineExpose({
  getApi,
  generateCalendarEvents, // Expose the utility function
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
  position: relative;
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
  opacity: 0.7;
  cursor: not-allowed;
}

:deep(.past-slot .slot-time) {
  color: #9ca3af;
}

:deep(.past-slot .slot-status) {
  color: #6b7280;
}

:deep(.past-slot:hover .fc-event-main) {
  transform: none;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

:deep(.too-late-to-book-slot .fc-event-main) {
  background: #fffbeb;
  border: 1px solid #fef3c7;
}

:deep(.too-late-to-book-slot .slot-status) {
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

:deep(.booked-by-user-slot .fc-event-main) {
  background: #fef2f2;
  border: 1px solid #fee2e2;
  cursor: pointer;
}

:deep(.booked-by-user-slot .slot-status) {
  color: #dc2626;
}

:deep(.booked-by-user-slot:hover .fc-event-main) {
  background: #fee2e2;
  transform: translateY(-1px);
  transition: all 0.2s;
}

:deep(.schedule-conflict-slot .fc-event-main) {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  cursor: not-allowed;
}

:deep(.schedule-conflict-slot .slot-status) {
  color: #6b7280;
}

:deep(.schedule-conflict-slot:hover .fc-event-main) {
  transform: none;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

:deep(.fc-event[data-tooltip]:hover::before) {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background: white;
  color: #1f2937;
  border-radius: 6px;
  font-size: 0.75rem;
  text-align: center;
  white-space: normal;
  max-width: 300px;
  min-width: 200px;
  word-wrap: break-word;
  z-index: 10000;
  margin-bottom: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid #e5e7eb;
}

:deep(.fc-event[data-tooltip]:hover::after) {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: white;
  margin-bottom: -6px;
  z-index: 10000;
}
</style>