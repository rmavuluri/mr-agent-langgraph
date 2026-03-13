export const insertUser = `
  INSERT INTO users (email, password_hash, date_of_birth)
  VALUES ($1, $2, $3)
  RETURNING id, email, date_of_birth, created_at
`;

export const selectUserByEmail = `
  SELECT id, email, password_hash, date_of_birth, created_at
  FROM users
  WHERE email = $1
`;

export const updatePasswordByEmail = `
  UPDATE users
  SET password_hash = $1, updated_at = now()
  WHERE email = $2
`;
