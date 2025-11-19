export function generateCustomId(year: number): string {
  const yearLastTwo = year.toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  
  return `93${yearLastTwo}${month}${randomDigits}`;
}