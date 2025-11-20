export function isValidPhoneNumber(phone: string): boolean {
  const pattern = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return pattern.test(phone);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  return phone;
}

export function maskPhoneNumber(phone: string): string {
  return phone.replace(/(\d{3})-(\d{4})-(\d{4})/, "$1-****-$3");
}

