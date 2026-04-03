import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isMiniPreview: boolean;
  useDatabase: boolean;
  colorMode: "light" | "dark";
  selectedTemplateId: string | null;
  buildMode: "auto" | "soft-only";
}

const initialState: UIState = {
  isMiniPreview: false,
  useDatabase: false,
  colorMode: "light",
  selectedTemplateId: null,
  buildMode: "auto",
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
    setColorMode(state, action: PayloadAction<"light" | "dark">) {
      state.colorMode = action.payload;
    },
    setSelectedTemplateId(state, action: PayloadAction<string | null>) {
      state.selectedTemplateId = action.payload;
    },
    setBuildMode(state, action: PayloadAction<"auto" | "soft-only">) {
      state.buildMode = action.payload;
    },
  },
});

export const {
  setMiniPreview,
  setUseDatabase,
  setColorMode,
  setSelectedTemplateId,
  setBuildMode,
} = uiSlice.actions;
export default uiSlice.reducer;
