export const monthOptions = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
export const expiryYearOptions = Array.from({ length: 20 }, (_, i) => currentYear + i);
