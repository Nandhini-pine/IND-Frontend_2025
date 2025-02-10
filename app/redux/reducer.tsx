import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  phone: '',
  otp: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPhone: (state, action) => {
      state.phone = action.payload;
    },
    setOtp: (state, action) => {
      state.otp = action.payload;
    },
  },
});

export const { setPhone, setOtp } = userSlice.actions;

export default userSlice.reducer;
