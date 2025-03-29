# Health Slot

A Vue.js-based frontend system for managing medical appointments. Provides core functionality for patients to book, view, and cancel appointments with healthcare providers.

## Features

### User Flow

- Welcome Screen: Collect patient name and email
- Doctor Selection: List of available medical professionals
- Appointment Scheduling:
  - 30-minute time slots in calendar view
  - Real-time slot status updates with tooltip, where necesary
  - Interactive booking confirmation modal
  - Allows cancellation of the booked slots

### Slot States

- Available: Open slot that can be booked
- Your Booking: Logged-in user's confirmed appointment
- Booked: Slot reserved by other patients
- Schedule Conflict: When user has booking with another doctor for the same time slot on the same day
- Too Late to Book: 15-minute booking cutoff before appointment time
- Past: Time slots that have already occurred

### State Management

The application uses Vuex for state management with localStorage integration for data persistence. This allows:

- User session data to persist between page refreshes
- Appointment bookings to be stored locally
- Multiple users to access their own bookings from the same device

**Responsive Design**: Mobile-optimized interface

## Limitations

- No authentication
- Basic UI
- **Timezone Handling**: The app displays time slots in the doctor's timezone (e.g., Australia/Sydney) without adjusting for the user's local timezone.

## Getting Started

### Prerequisites

- Node.js (version 18 recommended)
- Yarn package manager

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/PantaAastha/health-slot.git
   cd health-slot
   ```

2. Install dependencies

   ```bash
   yarn install
   ```

   If you encounter problems with engine compatibility, use:

   ```bash
   yarn install --ignore-engines
   ```

### Running the Application Locally

Start the development server:

```bash
yarn serve
```

The application will be available at `http://localhost:8080` (or another port if 8080 is busy).

### Running Tests

Execute the test suite:

```bash
yarn test
```

```bash
yarn test api.spec.js
```

```bash
yarn test utils.spec.js
```

The unit tests cover core functional logic including:

- Slot status management (Available, Your Booking, Booked, Schedule Conflict, Too Late to Book, Past )
- Data transformation

## Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Vue components
├── views/          # Page components
├── store/          # Vuex store modules
├── services/       # API services and data handling
├── utils/          # Helper functions
├── router/         # Navigation configuration
└── App.vue         # Root component
```
