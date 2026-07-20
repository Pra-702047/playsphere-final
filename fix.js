const fs = require('fs');
const files = ['components/booking/BookingForm.tsx', 'app/owner/turfs/page.tsx'];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\\s\?/g, '\\s?');
  content = content.replace(/\\\\d\{4\}/g, '\\d{4}');
  fs.writeFileSync(f, content);
});
