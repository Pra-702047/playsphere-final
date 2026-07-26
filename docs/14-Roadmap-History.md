# 15. Roadmap & Version History

## 15.1 Version History

### **v1.0 (MVP Release)**
- Firebase Authentication integration.
- Turf Discovery and Core Booking Engine.
- Razorpay Payment Gateway integration.

### **v1.1 (Owner Expansion)**
- Introduction of the Owner Dashboard.
- Support for Offline Bookings (Slot Blocking).
- Automated Settlement Engine and Commission calculation.

### **v1.2 (Security & PWA)** - *Current*
- Enterprise-grade Fraud Detection Dashboard.
- Progressive Web App (PWA) installation capability.
- Offline fallback UI.
- Automated API-driven Refunds.

---

## 15.2 Known Limitations
- **Cash Bookings Analytics**: Offline cash bookings do not contribute to the platform commission calculations.
- **Multi-Day Bookings**: The current architecture enforces single-slot (hourly) deterministic booking IDs. Multi-day tournament booking requires creating multiple individual transactions.

---

## 15.3 Future Roadmap (v2.0+)

1. **Tournament Module**: Allow organizers to create, manage brackets, and collect team entry fees directly on PlaySphere.
2. **AI Dynamic Pricing**: Suggest optimal pricing to owners based on historical utilization and local weather data.
3. **PlaySphere Wallet**: A digital wallet for users to store credits, receive instant refunds, and earn loyalty points.
4. **Subscription Plans**: Offer users a monthly "Pro" subscription for zero convenience fees and priority booking access.
5. **Native Mobile Apps**: Wrap the PWA in React Native or Flutter for App Store & Play Store distribution.
