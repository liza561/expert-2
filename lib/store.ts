// simple in-memory stores
export const wallets = new Map<string, number>(); // userId => balance
export const adminEarnings = new Map<string, number>(); // adminId => earnings
export const bookings: any[] = []; // all bookings
