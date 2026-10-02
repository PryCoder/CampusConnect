import { api } from '@/lib/axios';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  collegeId: string;
}

export interface SignupResponse {
  devOtp?: string;
  [key: string]: unknown;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user?: {
    id: string;
    name: string;
    email: string;
    collegeId: string;
  };
  [key: string]: unknown;
}

export const authApi = {
  signup: async (payload: SignupPayload): Promise<SignupResponse> => {
    const { data } = await api.post<SignupResponse>('/auth/signup', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    return data;
  },
};