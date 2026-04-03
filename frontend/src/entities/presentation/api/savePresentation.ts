import { PlateSlide } from "../../../shared/types";
import { getApiBaseUrl } from "../../../shared/config/apiBaseUrl";

export interface SavePresentationPayload {
  id: string;
  title: string;
  content: PlateSlide[];
  theme?: any | null;
}

export const savePresentation = async (payload: SavePresentationPayload) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/presentation/save-presentation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Save error:", error);
    throw error;
  }
};
