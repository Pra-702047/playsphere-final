# Razorpay Integration

PlaySphere utilizes Razorpay as the exclusive payment gateway to handle all online booking transactions. Razorpay ensures PCI-DSS compliance, abstracting credit card and UPI handling away from the PlaySphere application servers.

## Component Roles
- **Client:** Uses the Razorpay Checkout script (`https://checkout.razorpay.com/v1/checkout.js`) to display the payment modal.
- **Server:** Secures the transaction by generating orders and verifying signatures using the `razorpay` Node.js SDK.