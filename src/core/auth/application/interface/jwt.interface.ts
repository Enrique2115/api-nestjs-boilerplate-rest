export interface IJwtService {
  createToken(payload: unknown): string;
  checkToken(token: string): string;
}

export interface IJwtPayload {
  _id: string;
  authKey: string;
  email: string;
  role: string[];
}
