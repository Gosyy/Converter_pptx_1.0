import React from "react";
import UploadFileIcon from "@mui/icons-material/AddCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  FormHelperText,
  Alert,
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Select,
  Snackbar,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useGeneration } from "../../../shared/hooks";
import { useNavigate } from "react-router-dom";
import { LoadingOverlay } from "../../../shared/components";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import {
  setBuildMode,
  setSelectedTemplateId,
  setUseDatabase,
} from "../../../app/store/slices/uiSlice";
import {
  addAvailableTheme,
  setGlobalTheme,
} from "../../../app/store/slices/editorSlice";
import { Theme as PresTheme } from "../../../shared/types";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { validateTemplateBySchema } from "../../../shared/utils/templateSchema";

const TEMPLATE_STORAGE_KEY = "presentation_templates_v1";
const BUILD_MODE_STORAGE_KEY = "build_mode_v1";

export const PromptSend: React.FC = () => {
  const {
    inputText,
    setInputText,
    fileInputRef,
    fileStatus,
    handleFileChange,
    handleSubmit,
    loading,
    error,
    setError,
    model,
    setModel,
  } = useGeneration();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch<AppDispatch>();
  const useDatabase = useSelector((s: RootState) => s.ui.useDatabase);
  const selectedTemplateId = useSelector(
    (s: RootState) => s.ui.selectedTemplateId
  );
  const buildMode = useSelector((s: RootState) => s.ui.buildMode);
  const availableThemes = useSelector((s: RootState) => s.editor.availableThemes);
  const globalThemeId = useSelector((s: RootState) => s.editor.globalThemeId);
  const templateInputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  const [storedTemplates, setStoredTemplates] = useState<PresTheme[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setStoredTemplates(parsed);
        parsed.forEach((themeItem) => dispatch(addAvailableTheme(themeItem)));
      }
    } catch (err) {
      console.error("template load error", err);
    }
  }, [dispatch]);

  useEffect(() => {
    const storedMode = localStorage.getItem(BUILD_MODE_STORAGE_KEY);
    if (storedMode === "auto" || storedMode === "soft-only") {
      dispatch(setBuildMode(storedMode));
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem(BUILD_MODE_STORAGE_KEY, buildMode);
  }, [buildMode]);

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      navigate("/generate");
    }
  };

  const saveThemeAsTemplate = () => {
    const currentTheme = availableThemes.find((t) => t.id === globalThemeId);
    if (!currentTheme) return;
    const name = prompt("Название шаблона", `${currentTheme.name} (custom)`);
    if (!name) return;

    const customTheme: PresTheme = {
      ...currentTheme,
      id: `template-${Date.now()}`,
      name,
    };

    const updated = [...storedTemplates, customTheme];
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated));
    setStoredTemplates(updated);
    dispatch(addAvailableTheme(customTheme));
  };

  const handleTemplateUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const parsed = JSON.parse(text);
      const validation = validateTemplateBySchema(parsed);
      if (!validation.ok) {
        setError(`Невалидный JSON-шаблон (${validation.error})`);
        return;
      }
      const normalized = validation.value as PresTheme;

      const updated = [
        ...storedTemplates.filter((t) => t.id !== normalized.id),
        normalized,
      ];
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated));
      setStoredTemplates(updated);
      dispatch(addAvailableTheme(normalized));
      dispatch(setSelectedTemplateId(normalized.id));
      dispatch(setGlobalTheme(normalized.id));
    } catch (err) {
      console.error("template parse error", err);
      setError("Не удалось загрузить шаблон: проверьте JSON");
    } finally {
      e.target.value = "";
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <Box
      sx={{
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        p: 2,
        flexDirection: "column",
      }}
    >
      <Box
        textAlign="center"
        sx={{
          maxWidth: 1200,
          mb: 4,
        }}
      >
        <Typography
          variant={isMobile ? "h4" : "h2"}
          fontWeight="bold"
          sx={{
            m: 0,
            color: "text.primary",
            maxWidth: 1000,
          }}
        >
          Создавайте презентации без усилий за короткое время
        </Typography>
        <Typography
          variant={isMobile ? "subtitle1" : "h5"}
          sx={{
            margin: 0,
            mt: 2,
            color: "text.secondary",
            maxWidth: 1000,
          }}
        >
          Трансформируйте свои идеи в профессиональные презентации. Просто
          напишите свои мысли и ИИ сделает всё остальное.
        </Typography>
      </Box>

      <form
        onSubmit={onSubmit}
        style={{
          padding: "8px 8px",
          maxWidth: isMobile ? "100%" : "1000px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
            transition: "all .25s ease",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Select
              value={selectedTemplateId ?? ""}
              onChange={(e) => {
                const value = String(e.target.value);
                const id = value || null;
                dispatch(setSelectedTemplateId(id));
                if (id) dispatch(setGlobalTheme(id));
              }}
              displayEmpty
              size="small"
              sx={{ minWidth: 240, height: 40 }}
            >
              <MenuItem value="">Шаблон: автооформление</MenuItem>
              {availableThemes.map((themeItem) => (
                <MenuItem key={themeItem.id} value={themeItem.id}>
                  {themeItem.name}
                </MenuItem>
              ))}
            </Select>
            <input
              ref={templateInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleTemplateUpload}
            />
            <Tooltip title="Загрузить шаблон (.json)">
              <IconButton
                color="primary"
                onClick={() => templateInputRef.current?.click()}
              >
                <ArrowDownwardIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Сохранить текущую тему как шаблон">
              <IconButton color="primary" onClick={saveThemeAsTemplate}>
                <SaveOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useDatabase}
                  onChange={(e) => dispatch(setUseDatabase(e.target.checked))}
                  color="primary"
                  sx={{
                    "& .MuiSwitch-switchBase": {
                      transitionDuration: "250ms",
                    },
                  }}
                />
              }
              label={
                useDatabase
                  ? "Сохранять в БД: включено"
                  : "Сохранять в БД: отключено"
              }
              sx={{
                mr: 0,
                "& .MuiFormControlLabel-label": {
                  fontSize: 14,
                  color: "text.secondary",
                  transition: "color .25s ease",
                },
              }}
            />
            <Box>
              <Select
                size="small"
                value={buildMode}
                onChange={(e) =>
                  dispatch(setBuildMode(e.target.value as "auto" | "soft-only"))
                }
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="auto">Режим сборки: auto</MenuItem>
                <MenuItem value="soft-only">Режим сборки: soft-only</MenuItem>
              </Select>
              <FormHelperText>
                {`Команда: BUILD_MODE=${buildMode} docker compose up --build`}
              </FormHelperText>
            </Box>
          </Box>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={6}
          maxRows={10}
          size="small"
          placeholder="Прикрепите файл и введите в поле то, что хотите получить от ИИ в презентации."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              pr: 1,
              boxShadow: 4,
              backgroundColor: "background.paper",
              color: "text.primary",
            },
          }}
        />

        <Box
          mt={2}
          display="flex"
          alignItems="center"
          flexDirection={isMobile ? "column" : "row"}
          justifyContent="space-between"
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.docx,.pptx,.txt,.md"
            onChange={handleFileChange}
          />

          <Box
            width={isMobile ? "100%" : undefined}
            display={"flex"}
            justifyContent={"space-between"}
            mb={isMobile ? 2 : undefined}
          >
            <Button
              onClick={() => fileInputRef.current?.click()}
              startIcon={
                fileStatus?.converted ? <CheckCircleIcon /> : <UploadFileIcon />
              }
              variant="outlined"
              sx={{
                height: 40,
                borderRadius: "8px",
                color: "primary.main",
                borderColor: "primary.main",
                maxWidth: isMobile ? "100%" : 200,
                px: 2,
                justifyContent: "flex-start",
                textTransform: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                {fileStatus?.name || "Прикрепить файл"}
              </Box>
            </Button>

            <Select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              sx={{
                height: 40,
                ml: 2,
                maxWidth: isMobile ? "100%" : 200,
                borderRadius: "8px",
                color: "text.primary",
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.primary.main}`,
                textTransform: "none",
                fontSize: 15,
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  pl: 2,
                  pr: 4,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .MuiSelect-icon": {
                  color: "primary.main",
                  right: 10,
                },
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <MenuItem value="GigaChat-2-Pro">GigaChat-2-Pro</MenuItem>
              <MenuItem value="DeepSeek-V3">DeepSeek-V3</MenuItem>
            </Select>
          </Box>

          <Button
            type="submit"
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{
              height: 50,
              borderRadius: "12px",
              bgcolor: "primary.main",
              textTransform: "none",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
              width: isMobile ? "100%" : undefined,
            }}
          >
            Сгенерировать
          </Button>
        </Box>
      </form>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ zIndex: 2000 }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{
            width: "100%",
            color: "error.contrastText",
            bgcolor: "error.main",
            zIndex: 1101,
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};
