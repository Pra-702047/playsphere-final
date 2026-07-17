import crypto from "crypto";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Generates a cryptographically secure 6-digit OTP.
 * Uses crypto.randomInt to ensure uniform distribution and prevent predictability.
 */
export const generateSecureOTP = (): string => {
  // Generates a random integer between 100000 and 999999 (inclusive)
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
};

/**
 * Hashes the given string (OTP or password) using bcrypt.
 * @param data The raw string to hash.
 */
export const hashData = async (data: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(data, salt);
};

/**
 * Verifies if the provided raw string matches the hashed string.
 * @param rawData The user input string.
 * @param hashedData The hashed string from the database.
 */
export const verifyHash = async (
  rawData: string,
  hashedData: string
): Promise<boolean> => {
  return await bcrypt.compare(rawData, hashedData);
};
