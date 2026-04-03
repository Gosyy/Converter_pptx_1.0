import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PromptStateProps {
  fileName: string | null;
  text: string;
  loading: boolean;
  generating: boolean;
}

const initialState: PromptStateProps = {
  fileName: null,
  text: "",
  loading: false,
  generating: false,
};

const promptSlice = createSlice({
  name: "prompt",
  initialState,
  reducers: {
    setPromptSettings: (
      state,
      action: PayloadAction<{ fileName?: string | null; text: string }>
    ) => {
      const { text, fileName } = action.payload;
      state.text = text;
      state.fileName = fileName ?? null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.generating = action.payload;
    },
  },
});

export const { setPromptSettings, setLoading, setGenerating } =
  promptSlice.actions;
export default promptSlice.reducer;
