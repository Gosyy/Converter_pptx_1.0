import { getApiBaseUrl } from "../../../shared/config/apiBaseUrl";

const API_URL = getApiBaseUrl();

export const deletePresentation = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/presentation/presentations/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Ошибка удаления презентации");
  } catch (err) {
    console.error(err);
    throw err;
  }
};
