import { getApiBaseUrl } from "../../../shared/config/apiBaseUrl";

export interface UpdateUserPayload {
  name?: string;
  email?: string;
}

export const updateUser = async (payload: UpdateUserPayload) => {
  const res = await fetch(`${getApiBaseUrl()}/user/edit`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Ошибка");
  }
  return res.json();
};
