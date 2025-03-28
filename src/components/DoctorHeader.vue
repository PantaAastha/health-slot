<template>
  <header class="doctor-header">
    <div class="left-section">
      <button class="back-btn" @click="$emit('back')">
        <i class="fas fa-arrow-left"></i>
      </button>
      <div class="doctor-info">
        <div class="avatar">
          {{ doctor?.name?.[0] || "D" }}
        </div>
        <div class="details">
          <h1>{{ doctor?.name }}</h1>
          <p class="subtitle">
            {{ doctor?.speciality }} | {{ doctor?.timezone }}
          </p>
        </div>
      </div>
    </div>

    <div class="center-section">
      <span class="date-range">{{ formattedDateRange }}</span>
    </div>

    <div class="right-section">
      <div class="view-controls">
        <button class="nav-btn" @click="$emit('prev')">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="view-toggle">
          <button
            :class="['toggle-btn', { active: currentView === 'timeGridWeek' }]"
            @click="$emit('view-change', 'timeGridWeek')"
          >
            Week
          </button>
          <button
            :class="['toggle-btn', { active: currentView === 'timeGridDay' }]"
            @click="$emit('view-change', 'timeGridDay')"
          >
            Day
          </button>
        </div>
        <button class="nav-btn" @click="$emit('next')">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <button class="book-btn" @click="$emit('book')">
        <i class="fas fa-plus"></i>
        Book Now
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed, defineProps, defineEmits } from "vue";

const props = defineProps({
  doctor: {
    type: Object,
    required: true,
  },
  currentView: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

defineEmits(["prev", "next", "view-change", "book", "back"]);

const formattedDateRange = computed(() => {
  if (!props.startDate || !props.endDate) return "";

  const shortOptions = { month: "short", day: "numeric" };
  const yearOptions = { year: "numeric" };

  // Get the last day of the current view
  const viewEnd = new Date(props.endDate);
  viewEnd.setDate(viewEnd.getDate() - 1); // Subtract one day as endDate is exclusive

  const start = props.startDate.toLocaleDateString("en-US", shortOptions);
  const end = viewEnd.toLocaleDateString("en-US", shortOptions);
  const year = viewEnd.toLocaleDateString("en-US", yearOptions);

  return props.currentView === "timeGridWeek"
    ? `${start} - ${end}, ${year}`
    : props.startDate.toLocaleDateString("en-US", {
        ...shortOptions,
        year: "numeric",
      });
});
</script>

<style scoped>
.doctor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  height: 64px;
  flex-wrap: wrap;
  gap: 1rem;
}

.left-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #111827;
}

.back-btn i {
  font-size: 1.25rem;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #00a3e0;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
}

.details h1 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.subtitle {
  color: #6b7280;
  font-size: 0.813rem;
  margin: 0.125rem 0 0;
}

.center-section {
  flex: 2;
  display: flex;
  justify-content: center;
}

.date-range {
  font-size: 0.938rem;
  color: #111827;
  font-weight: 500;
}

.right-section {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  align-items: center;
}

.view-controls {
  display: flex;
  align-items: center;
}

.view-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 0.375rem;
  padding: 0.125rem;
}

.nav-btn {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.375rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 0.875rem;
  height: 100%;
}

.nav-btn:first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
  border-right: 1px solid #e5e7eb;
  margin-right: -1px;
}

.nav-btn:last-child {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  border-left: 1px solid #e5e7eb;
  margin-left: -1px;
}

.nav-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.nav-btn i {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn {
  background: none;
  border: none;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
  border-radius: 0.25rem;
}

.toggle-btn.active {
  background: white;
  color: #111827;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.book-btn {
  background: #00a3e0;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s;
}

.book-btn:hover {
  background: #0091c7;
}

.book-btn i {
  font-size: 0.75rem;
}

/* Mobile styles */
@media (max-width: 768px) {
  .doctor-header {
    padding: 0.5rem 1rem;
    height: auto;
  }

  .left-section {
    flex: 0 0 100%;
    order: 1;
  }

  .center-section {
    flex: 1;
    order: 2;
  }

  .right-section {
    flex: auto;
    order: 2;
    width: auto;
  }

  .doctor-info .details h1 {
    font-size: 1rem;
  }

  .doctor-info .subtitle {
    font-size: 0.75rem;
  }

  .view-controls {
    margin-left: auto;
  }

  .book-btn {
    display: none;
  }

  .view-toggle {
    display: none;
  }

  .date-range {
    font-size: 0.875rem;
  }
}

/* Tablet styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .doctor-header {
    padding: 0.75rem;
  }

  .doctor-info .details h1 {
    font-size: 1rem;
  }

  .book-btn {
    padding: 0.5rem;
  }

  .book-btn i {
    margin-right: 0;
  }

  .book-btn span {
    display: none;
  }
}

@media (max-width: 768px) {
  .view-toggle button[data-view="timeGridWeek"] {
    display: none;
  }
}
</style> 