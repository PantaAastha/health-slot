## Features

- Welcome page to collect user name and email
- Personalized greeting throughout the app
- List of active doctors
- View available 30-minute time slots per doctor
- Book an appointment with a confirmation modal
- Option to receive a notification (simulated) 30 minutes before the appointment
- Bookings persisted in localStorage

## Limitations

- **Notifications**: As a front-end-only app, email notifications are simulated. In a production environment, a backend would integrate with an email service (e.g., SendGrid) to send reminders.
- No authentication
- Basic UI, aligned with Shiftcare’s aesthetic
- **Timezone Handling**: The app displays time slots in the doctor’s timezone (e.g., Australia/Sydney) without adjusting for the user’s local timezone. In a production environment, a library like Moment.js or date-fns with timezone support could be used to convert times.
