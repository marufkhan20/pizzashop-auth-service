import type { Request } from "express";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
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

export interface ITenant {
  name: string;
  address: string;
}

export interface LimitedUserData {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  tenantId: number;
}

export interface UpdateUserRequest extends Request {
  body: LimitedUserData;
}

export interface UserQueryParams {
  perPage: number;
  currentPage: number;
  q: string;
  role: string;
}

export interface TenantQueryParams {
  q: string;
  perPage: number;
  currentPage: number;
}
