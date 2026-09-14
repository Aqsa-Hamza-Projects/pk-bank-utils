export function maskAccountNumber(accountNumber: string): string {
  if (typeof accountNumber !== 'string') return '';
  if (accountNumber.length <= 4) return accountNumber;
  const visible = accountNumber.slice(-4);
  return '*'.repeat(accountNumber.length - 4) + visible;
}
