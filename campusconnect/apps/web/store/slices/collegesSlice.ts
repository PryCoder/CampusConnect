import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collegesApi, type College } from '@/lib/api/colleges';

interface CollegesState {
  items: College[];
  loading: boolean;
  error: string | null;
}

const initialState: CollegesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchColleges = createAsyncThunk<
  College[],
  void,
  { rejectValue: string; state: { colleges: CollegesState } }
>(
  'colleges/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await collegesApi.list();
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
  {
    // Skip network call if already loaded
    condition: (_, { getState }) => {
      const { items, loading } = getState().colleges;
      return !loading && items.length === 0;
    },
  }
);

const collegesSlice = createSlice({
  name: 'colleges',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchColleges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColleges.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchColleges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load colleges';
      });
  },
});

export default collegesSlice.reducer;