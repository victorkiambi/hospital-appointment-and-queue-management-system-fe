# MedBook Frontend – User Guide

Welcome to MedBook! This guide will help you get started and make the most of the system, whether you are an **Admin**, **Doctor**, or **Patient**.

---

## Table of Contents
- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Login & Registration](#login--registration)
- [Navigation Overview](#navigation-overview)
- [Admin Guide](#admin-guide)
- [Doctor Guide](#doctor-guide)
- [Patient Guide](#patient-guide)
- [Notifications](#notifications)
- [Test Credentials](#test-credentials)

---

## Introduction
MedBook is a real-time medical queue and appointment management system. It provides role-based dashboards and features for Admins, Doctors, and Patients.

---

## Getting Started
1. **Open the application** in your browser: [https://frontend-wandering-dust-3957.fly.dev/](https://frontend-wandering-dust-3957.fly.dev/)
2. **Register** for a new account or **login** if you already have one.
3. Your dashboard and available features depend on your assigned role.

---

## Login & Registration
- **Login:**
  - Go to `/login`.
  - Enter your email and password.
  - Click **Login**.
- **Register:**
  - Go to `/register`.
  - Fill in your name, email, and password.
  - Click **Register**.
  - You may be assigned a role by an admin or during registration.

---

## Navigation Overview
- **Admin Dashboard:** `/admin/dashboard`
- **Doctor Dashboard:** `/doctor/dashboard`
- **Patient Dashboard:** `/patient/dashboard`
- **Profile:** `/doctor/profile` or `/patient/profile`
- Use the sidebar or top navigation to switch between sections.

---

## Admin Guide
### System Stats
- View total users, doctors, patients, appointments, and queues at the top of the dashboard.

### User Management
- **Filter/Search Users:**
  - Use the search bar to filter users by name or role.
- **Create Doctor:**
  - Click the **+ Doctor** button.
  - Fill in the form and set availability.
- **View User Details:**
  - Click **Details** next to a user to see more info.

### Appointments
- View all appointments in the system.
- Filter by status, doctor, or date.

---

## Doctor Guide
### Today's Appointments
- See a list of your scheduled appointments for the day.
- Click **Details** to view patient info.

### Queue Management
- View the current patient queue.
- Click **Call Next** to call the next patient (triggers real-time notification for the patient).

### Edit Availability
- Click **Edit Availability** to update your working schedule.

---

## Patient Guide
### Book an Appointment
1. Click **Book Appointment**.
2. Select a doctor, date, and time slot.
3. Confirm your booking.

### View & Cancel Appointments
- See all your appointments in the dashboard.
- Click **Cancel** to remove an upcoming or expired appointment.

### Queue
- View your current queue position and doctor availability.
- You will receive a notification when you are called by the doctor.

---

## Notifications
- **Success/Error:** Shown for actions like booking, cancelling, or errors.
- **Real-Time:** When a doctor calls you, a notification appears instantly.

---

## Test Credentials

Use the following test accounts to log in as different roles:

### Admin
- **Email:** admin@example.com
- **Password:** password

### Doctors
- **Email:** alice.smith@hospital.com / **Password:** password
- **Email:** bob.johnson@hospital.com / **Password:** password
- **Email:** carol.lee@hospital.com / **Password:** password
- **Email:** david.kim@hospital.com / **Password:** password
- **Email:** eva.brown@hospital.com / **Password:** password

### Patients
- **Email:** john.doe@example.com / **Password:** password
- **Email:** jane.smith@example.com / **Password:** password
- **Email:** michael.green@example.com / **Password:** password
- **Email:** emily.white@example.com / **Password:** password
- **Email:** chris.black@example.com / **Password:** password

---
