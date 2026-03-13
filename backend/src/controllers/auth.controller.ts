import { Request, Response } from 'express';
import type { SignupRequestBody, SignupResponse, LoginRequestBody, LoginResponse, ChangePasswordRequestBody } from '../types';
import * as authService from '../services/auth.service';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?!.*\s).+$/;

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function validateSignupBody(body: unknown): body is SignupRequestBody {
  if (body === null || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  if (!isValidEmail(b.email)) return false;
  if (typeof b.password !== 'string') return false;
  if (b.password.length < PASSWORD_MIN_LENGTH) return false;
  if (!PASSWORD_REGEX.test(b.password)) return false;
  if (b.confirmPassword !== b.password) return false;
  if (!isValidDateString(b.dateOfBirth)) return false;
  return true;
}

interface PgError extends Error {
  code?: string;
}

function isUniqueViolation(err: unknown): err is PgError {
  return typeof err === 'object' && err !== null && (err as PgError).code === '23505';
}

export async function signup(req: Request, res: Response): Promise<void> {
  if (!validateSignupBody(req.body)) {
    res.status(400).json({
      error: 'Invalid request',
      message: 'Email, password (8+ chars, one capital, one number, no spaces), confirmPassword, and dateOfBirth (YYYY-MM-DD) are required.',
    });
    return;
  }

  const body = req.body as SignupRequestBody;

  try {
    const user = await authService.createUser(body);
    const payload: SignupResponse = {
      user,
      message: 'Account created successfully',
    };
    res.status(201).json(payload);
  } catch (err) {
    if (isUniqueViolation(err)) {
      res.status(409).json({ error: 'Conflict', message: 'An account with this email already exists.' });
      return;
    }
    throw err;
  }
}

function validateLoginBody(body: unknown): body is LoginRequestBody {
  if (body === null || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return isValidEmail(b.email) && typeof b.password === 'string' && b.password.length > 0;
}

export async function login(req: Request, res: Response): Promise<void> {
  if (!validateLoginBody(req.body)) {
    res.status(400).json({
      error: 'Invalid request',
      message: 'Email and password are required.',
    });
    return;
  }

  const body = req.body as LoginRequestBody;

  try {
    const user = await authService.login(body);
    const payload: LoginResponse = {
      user,
      message: 'Logged in successfully',
    };
    res.status(200).json(payload);
  } catch (err) {
    const status = (err as Error & { statusCode?: number }).statusCode ?? 500;
    const message = (err as Error).message ?? 'Login failed';
    res.status(status).json({ error: 'Error', message });
    if (status === 500) throw err;
  }
}

function validateChangePasswordBody(body: unknown): body is ChangePasswordRequestBody {
  if (body === null || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  if (!isValidEmail(b.email)) return false;
  if (typeof b.currentPassword !== 'string' || b.currentPassword.length === 0) return false;
  if (typeof b.newPassword !== 'string') return false;
  if (b.newPassword.length < PASSWORD_MIN_LENGTH) return false;
  if (!PASSWORD_REGEX.test(b.newPassword)) return false;
  if (b.confirmNewPassword !== b.newPassword) return false;
  return true;
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  if (!validateChangePasswordBody(req.body)) {
    res.status(400).json({
      error: 'Invalid request',
      message: 'Email, currentPassword, newPassword (8+ chars, one capital, one number, no spaces), and confirmNewPassword are required.',
    });
    return;
  }

  const body = req.body as ChangePasswordRequestBody;

  try {
    await authService.changePassword(body);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    const status = (err as Error & { statusCode?: number }).statusCode ?? 500;
    const message = (err as Error).message ?? 'Failed to change password';
    res.status(status).json({ error: 'Error', message });
    if (status === 500) throw err;
  }
}
