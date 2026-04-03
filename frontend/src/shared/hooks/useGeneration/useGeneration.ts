import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { markdownToSlides } from "../../utils/markdownToSlides";
import { setSlides } from "../../../app/store/slices/editorSlice";
import { setGlobalTheme } from "../../../app/store/slices/editorSlice";
import { PlateSlide } from "../../types";
import {
  setLoading,
  setGenerating,
  setPromptSettings,
} from "../../../app/store/slices/promptSlice";
import { getContext } from "../../../entities";
import { nanoid } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  file?: File | null;
}

let cachedSelectedFile: File | null = null;

export const useGeneration = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { text, loading, fileName } = useSelector(
    (state: RootState) => state.prompt
  );
  const selectedTemplateId = useSelector(
    (state: RootState) => state.ui.selectedTemplateId
  );
  const availableThemes = useSelector(
    (state: RootState) => state.editor.availableThemes
  );
  const [inputText, setInputText] = useState(text ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(
    cachedSelectedFile
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string>("GigaChat-2-Pro");
  const dispatch = useDispatch<AppDispatch>();

  const [fileStatus, setFileStatus] = useState<{
    name: string;
    converted: boolean;
  } | null>(
    fileName
      ? {
          name: fileName,
          converted: true,
        }
      : null
  );

  useEffect(() => {
    const aiMsg: ChatMessage = {
      id: uuidv4(),
      type: "ai",
      content: "Привет! Я помогу тебе создать презентацию по файлу.",
    };
    setMessages([aiMsg]);
  }, []);

  useEffect(() => {
    dispatch(
      setPromptSettings({
        text: inputText,
        fileName: selectedFile?.name ?? fileName ?? null,
      })
    );
  }, [dispatch, inputText, selectedFile, fileName]);

  const sendMessageWS = async () => {
    const promptText = inputText.trim() ? inputText : text;
    const promptFile = selectedFile ?? cachedSelectedFile;

    if (!promptText.trim()) {
      setError("Введите текст запроса!");
      return false;
    }

    const userMsg: ChatMessage = {
      id: uuidv4(),
      type: "user",
      content: promptText,
      file: promptFile,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setFileStatus(
      promptFile ? { name: promptFile.name, converted: false } : null
    );

    try {
      if (selectedTemplateId) {
        dispatch(setGlobalTheme(selectedTemplateId));
      } else if (availableThemes.length > 0) {
        const randomTheme =
          availableThemes[Math.floor(Math.random() * availableThemes.length)];
        dispatch(setGlobalTheme(randomTheme.id));
      }

      dispatch(setGenerating(true));
      dispatch(setLoading(true));

      const aiMsg: ChatMessage = {
        id: uuidv4(),
        type: "ai",
        content: "",
      };
      setMessages((prev) => [...prev, aiMsg]);

      let fullText = "";
      let allSlides: PlateSlide[] = [];
      let firstChunkReceived = false;
      let updateScheduled = false;

      await getContext(promptFile ?? undefined, model, userMsg.content, (chunk) => {
        fullText += chunk;

        if (!firstChunkReceived) {
          firstChunkReceived = true;
          dispatch(setLoading(false));
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsg.id ? { ...m, content: fullText } : m))
        );

        const parts = fullText.split(/^#\s+/gm).filter((p) => p.trim() !== "");

        const layouts: PlateSlide["layout"][] = [
          "left-image",
          "right-image",
          "bottom-image",
          "top-image",
        ];

        let layoutIndex = 0;

        parts.forEach((part, index) => {
          const slideText = "# " + part;
          const titleMatch = slideText.match(/^#\s*(.+)/);
          const title = titleMatch ? titleMatch[1] : "Slide";

          const parsedSlides = markdownToSlides(slideText);
          const parsed = parsedSlides[0] || {
            content: [],
            layout: "text-only",
          };

          const hasImage = parsed.content.some((b) => b.type === "image");
          const layout = hasImage
            ? layouts[layoutIndex % layouts.length]
            : "text-only";

          if (!allSlides[index]) {
            allSlides[index] = {
              id: nanoid(),
              title,
              markdownText: slideText,
              content: parsed.content,
              layout,
            };
          } else {
            allSlides[index] = {
              ...allSlides[index],
              markdownText: slideText,
              content: parsed.content,
              layout,
            };
          }

          if (hasImage) layoutIndex++;
        });

        if (!updateScheduled) {
          updateScheduled = true;
          if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
          updateTimerRef.current = setTimeout(() => {
            dispatch(setSlides([...allSlides]));
            updateScheduled = false;
          }, 300);
        }
      });

      if (promptFile) {
        setFileStatus({ name: promptFile.name, converted: true });
        setSelectedFile(promptFile);
        cachedSelectedFile = promptFile;
      } else {
        setFileStatus(null);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";

      return true;
    } catch (err) {
      console.error(err);
      dispatch(setLoading(false));
      setError("Ошибка генерации");
      setFileStatus(null);
      return false;
    } finally {
      dispatch(setGenerating(false));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    cachedSelectedFile = file;
    setFileStatus({ name: file.name, converted: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    return sendMessageWS();
  };

  const regenerateSlides = async () => {
    return sendMessageWS();
  };

  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  return {
    inputText,
    setInputText,
    messages,
    fileInputRef,
    fileStatus,
    handleFileChange,
    handleSubmit,
    loading,
    error,
    setError,
    model,
    setModel,
    regenerateSlides,
  };
};
