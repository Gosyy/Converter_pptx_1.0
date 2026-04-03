import { SlideBlock } from "../../../shared/types";
import { getApiBaseUrl } from "../../../shared/config/apiBaseUrl";

export const editSlide = async ({
  slide,
  text,
}: {
  slide: { slide_id: string; title: string; content: SlideBlock[] };
  text?: string;
}) => {
  const response = await fetch(
    `${getApiBaseUrl()}/presentation/edit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text || undefined,
        action: "custom",
        slide,
      }),
    }
  );

  if (!response.ok) throw new Error("Ошибка при отправке данных");

  return await response.text();
};
