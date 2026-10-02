import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  authApi,
  type SignupPayload,
  type SignupResponse,
  type LoginPayload,
  type LoginResponse,
} from '@/lib/api/auth';

interface AuthState {
  // signup
  signupLoading: boolean;
  signupError: string | null;
  lastSignup: SignupResponse | null;

  // login
  loginLoading: boolean;
  loginError: string | null;
  user: LoginResponse['user'] | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  signupLoading: false,
  signupError: null,
  lastSignup: null,

  loginLoading: false,
  loginError: null,
  user: null,
  isAuthenticated: false,
};

export const signupUser = createAsyncThunk<
  SignupResponse,
  SignupPayload,
  { rejectValue: string }
>('auth/signup', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.signup(payload);
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.login(payload);
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearSignupError(state) {
      state.signupError = null;
    },
    clearLoginError(state) {
      state.loginError = null;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loginError = null;
      state.signupError = null;
    },
    resetAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ---- signup ----
      .addCase(signupUser.pending, (state) => {
        state.signupLoading = true;
        state.signupError = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.signupLoading = false;
        state.lastSignup = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.signupLoading = false;
        state.signupError = action.payload ?? 'Signup failed';
      })

      // ---- login ----
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload.user ?? null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload ?? 'Login failed';
      });
  },
});

export const {
  clearSignupError,
  clearLoginError,
  logout,
  resetAuthState,
} = authSlice.actions;
export default authSlice.reducer;