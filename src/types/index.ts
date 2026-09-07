import type { Request } from "express";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterUserRequest extends Request {
  body: UserData;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface LoginUserRequest extends Request {
  body: LoginUserData;
}

export interface AuthRequest extends Request {
  auth: {
    sub: number;
    role: string;
    jwtid: number;
  };
}

export interface IRefreshTokenPayload {
  jwtid: string;
}

export interface ITenant {
  name: string;
  address: string;
}

export interface CreateTenantRequest extends Request {
  body: ITenant;
}
