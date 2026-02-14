# Precision Toronto — Car Detailing Website (Booking System + Admin Dashboard)

A modern, high-performance car detailing website built with a complete booking system, service scheduling, and an admin dashboard.

This project includes:

- Fully working service booking flow
- Add-ons support
- Availability slot generation
- Multi-service duration calculation
- Admin dashboard to manage bookings
- Smooth optimized frontend (lazy loading + code splitting)
- Backend validation and overlap prevention

---

## 🚀 Tech Stack

### Frontend
- React (Vite / CRA compatible)
- React Router DOM
- Framer Motion (animations)
- Tailwind CSS (UI styling)
- Lucide React (icons)
- React Three Fiber + Drei (3D car models)
- Date-fns (date formatting)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Booking API (CRUD)
- Availability / scheduling API
- Contact Form Email API

---

## ✅ Key Features

### Booking System
- Select vehicle type
- Select services + add-ons
- Duration automatically calculated (services + add-ons)
- Booking slot selection based on availability
- Booking confirmation page
- Backend prevents overlaps (booking conflicts)

### Admin Dashboard
- View all bookings
- Approve bookings
- Delete bookings
- Edit booking (status + reschedule)
- Service schedule timeline per booking
- Mark services as done
- Export bookings to CSV
- Bulk delete

### Performance Optimizations
- Lazy loading for heavy components
- Intersection Observer for on-scroll mounting
- Connection-aware prefetching
- 3D model viewer optimized for low-end devices
- Skeleton loading for smooth UX

---

## ⚙️ Installation & Setup

### 1) Clone the repo
```bash
git clone https://github.com/yourusername/precision-toronto.git
cd precision-toronto

