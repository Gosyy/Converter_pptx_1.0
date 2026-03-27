import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isMiniPreview: boolean;
  useDatabase: boolean;
}

const initialState: UIState = {
  isMiniPreview: false,
  useDatabase: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMiniPreview(state, action: PayloadAction<boolean>) {
      state.isMiniPreview = action.payload;
    },
    setUseDatabase(state, action: PayloadAction<boolean>) {
      state.useDatabase = action.payload;
    },
  },
});

export const { setMiniPreview, setUseDatabase } = uiSlice.actions;
export default uiSlice.reducer;
