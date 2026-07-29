# Lazy Loading

## Component Level
PlaySphere utilizes Next.js dynamic imports (`next/dynamic`) for heavy, non-critical components to defer their loading until they are required by the user.

```javascript
import dynamic from 'next/dynamic';

// The Payment Modal is only loaded when the user clicks 'Book Now'
const PaymentModal = dynamic(() => import('@/components/booking/PaymentModal'), {
  ssr: false,
});
```

## Route Level
Route-based code splitting is handled automatically by the Next.js App Router, ensuring users only download the JavaScript strictly necessary for the page they are visiting.