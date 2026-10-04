const formatter = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
});

export function formatUSD(value: number): string {
  return formatter.format(value);
}

export function formatUSDLabel(value: number): string {
  return `${value.toFixed(2)} dólares`;
}