import { Theme } from "../types";

export const templateJsonSchema = {
  type: "object",
  required: ["id", "name", "colors", "fonts"],
  properties: {
    id: { type: "string", minLength: 1 },
    name: { type: "string", minLength: 1 },
    colors: {
      type: "object",
      required: ["heading", "paragraph"],
      properties: {
        background: { type: "string" },
        heading: { type: "string", minLength: 1 },
        paragraph: { type: "string", minLength: 1 },
      },
    },
    fonts: {
      type: "object",
      required: ["heading", "paragraph"],
      properties: {
        heading: { type: "string", minLength: 1 },
        paragraph: { type: "string", minLength: 1 },
      },
    },
  },
} as const;

const isNonEmptyString = (v: unknown) => typeof v === "string" && v.trim().length > 0;

export const validateTemplateBySchema = (
  input: unknown
): { ok: true; value: Theme } | { ok: false; error: string } => {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Schema error: root object expected" };
  }
  const obj = input as Record<string, any>;

  if (!isNonEmptyString(obj.id)) return { ok: false, error: "Schema error: id" };
  if (!isNonEmptyString(obj.name)) return { ok: false, error: "Schema error: name" };

  if (!obj.colors || typeof obj.colors !== "object") {
    return { ok: false, error: "Schema error: colors" };
  }
  if (!isNonEmptyString(obj.colors.heading)) {
    return { ok: false, error: "Schema error: colors.heading" };
  }
  if (!isNonEmptyString(obj.colors.paragraph)) {
    return { ok: false, error: "Schema error: colors.paragraph" };
  }

  if (!obj.fonts || typeof obj.fonts !== "object") {
    return { ok: false, error: "Schema error: fonts" };
  }
  if (!isNonEmptyString(obj.fonts.heading)) {
    return { ok: false, error: "Schema error: fonts.heading" };
  }
  if (!isNonEmptyString(obj.fonts.paragraph)) {
    return { ok: false, error: "Schema error: fonts.paragraph" };
  }

  return { ok: true, value: obj as Theme };
};
