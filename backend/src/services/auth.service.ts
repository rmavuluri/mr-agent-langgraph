import bcrypt from 'bcrypt';
import { pool } from '../db/client';
import { insertUser, selectUserByEmail, updatePasswordByEmail } from '../db/queries';
import type { SignupRequestBody, LoginRequestBody, ChangePasswordRequestBody, UserResponse } from '../types';

const SALT_ROUNDS = 10;

export async function createUser(body: SignupRequestBody): Promise<UserResponse> {
  const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);
  const email = body.email.trim().toLowerCase();
  const dateOfBirth = body.dateOfBirth;

  const result = await pool.query(insertUser, [email, passwordHash, dateOfBirth]);
  const row = result.rows[0];

  return toUserResponse(row);
}

export async function login(body: LoginRequestBody): Promise<UserResponse> {
  const email = body.email.trim().toLowerCase();
  const result = await pool.query(selectUserByEmail, [email]);
  const row = result.rows[0];

  if (!row) {
    const err = new Error('Invalid email or password');
    (err as Error & { statusCode: number }).statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(body.password, row.password_hash);
  if (!match) {
    const err = new Error('Invalid email or password');
    (err as Error & { statusCode: number }).statusCode = 401;
    throw err;
  }

  return toUserResponse(row);
}

export async function changePassword(body: ChangePasswordRequestBody): Promise<void> {
  const email = body.email.trim().toLowerCase();
  const result = await pool.query(selectUserByEmail, [email]);
  const row = result.rows[0];

  if (!row) {
    const err = new Error('Invalid email or password');
    (err as Error & { statusCode: number }).statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(body.currentPassword, row.password_hash);
  if (!match) {
    const err = new Error('Current password is incorrect');
    (err as Error & { statusCode: number }).statusCode = 401;
    throw err;
  }

  const newHash = await bcrypt.hash(body.newPassword, SALT_ROUNDS);
  await pool.query(updatePasswordByEmail, [newHash, email]);
}

function toUserResponse(row: {
  id: string;
  email: string;
  date_of_birth: string | Date;
  created_at: string | Date;
}): UserResponse {
  const dob = row.date_of_birth instanceof Date
    ? row.date_of_birth.toISOString().slice(0, 10)
    : String(row.date_of_birth).slice(0, 10);
  const createdAt = row.created_at instanceof Date
    ? row.created_at.toISOString()
    : String(row.created_at);

  return {
    id: row.id,
    email: row.email,
    dateOfBirth: dob,
    createdAt,
  };
}
