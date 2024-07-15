export function generateOtp(): string {
  const otpLength = 6;
  let otp = '';

  for (let i = 0; i < otpLength; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }

  return otp;
}
