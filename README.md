# 🚍 TransBook – Transport Booking Web App

**TransBook** is a modern and scalable transport booking web application designed to simplify how users book, manage, and track their travel journeys. The platform supports customer reservations, ride management, admin controls, driver dashboards, and secure payments—all in one place.

---

## 🔗 Live Demo (Currently offline)

[Visit the Live App](https://transbook.com)  
(Admin: [admin.transbook.com](https://admin.transbook.com))
(Driver: [driver.transbook.com](https://driver.transbook.com))
---

## 📸 Screenshots

![TransBook Homepage]
*Homepage of TransBook showing featured rides and a smooth user interface.*
![homepage](https://github.com/user-attachments/assets/79069d45-e362-4109-9f28-9092388e9748)

---

## ⚙️ Features

### 👥 User Features
- Search and filter rides by route, date, and time.
- Book transport and receive digital travel receipts.
- OTP-based registration and login.
- Responsive design for mobile, tablet, and desktop.

### 👨‍✈️ Driver Dashboard
- View assigned rides.
- Approve or reject bookings.
- Track current and upcoming rides.

### 🔐 Admin Panel
- Manage users, drivers, and trips.
- View logs and system reports.
- Assign or unassign routes.
- Secure admin authentication.

### 💳 Payments
- Integration with secure payment gateway (e.g., Paystack).
- Receipts generated after successful bookings.

---

## 🛠 Tech Stack

**Frontend**  
- React + Vite  
- Global CSS
- React MUI
- Redux  
- React Router v7 
- Axios
- Firebase push notifications

**Backend**  
- Node.js  
- Express.js  
- MongoDB (Mongoose ODM)  
- Nodemailer (Email verification)  
- JWT & Sessions for Auth  
- Google reCAPTCHA (v2 & v3)
- WebSocket 
- Firebase Admin

**Deployment**  
- Render (Frontend)  
- Render (Backend)  
- MongoDB Atlas (Database)

---

## 📁 Project Structure
```bash
TransBook/
├── client/ # React frontend
│ ├── components/
│ ├── pages/
│ └── ...
├── server/ # Node.js backend
│ ├── controllers/
│ ├── routes/
│ ├── models/
│ └── ...
└── README.md
```

# Run backend
```bash
cd server
npm run dev
```

# Run frontend
```bash
cd ../client
npm run dev
```

✍️ Author
Jeremiah Deku
GitHub | LinkedIn

📄 License
This project is licensed under the MIT License.

🙌 Acknowledgments
Paystack for payment integration

OpenAI for chatbot implementation

reCAPTCHA by Google + Custom captcha

Vite + React for an ultra-fast frontend experience
