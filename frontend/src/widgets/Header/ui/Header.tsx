import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Button,
  Switch,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { ReactComponent as Logo } from "../../../shared/assets/logo/logo-cut.svg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SlideNavigationToolbar from "../../../features/presentation/ui/components/SlideNavigationToolbar";
import { useHeader } from "../hooks";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { setColorMode } from "../../../app/store/slices/uiSlice";

const MotionAppBar = motion(AppBar);

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { controls, location } = useHeader();
  const dispatch = useDispatch<AppDispatch>();
  const colorMode = useSelector((state: RootState) => state.ui.colorMode);

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <MotionAppBar
      position="fixed"
      color="transparent"
      animate={controls}
      sx={{
        backgroundColor: "transparent",
        borderBottom: "1px solid transparent",
        boxShadow: "none",
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: isMobile ? 0 : 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={() => navigate("/")}
            sx={{
              width: 51,
              height: 51,
            }}
          >
            <Logo sx={{ color: "primary.main" }} />
          </IconButton>
          {(!isMobile || location.pathname !== "/editor") && (
            <Typography
              variant={isMobile ? "subtitle2" : "h6"}
              component="div"
              sx={{ color: "text.primary" }}
            >
              AIFixed
            </Typography>
          )}
        </Box>
        {location.pathname === "/editor" && <SlideNavigationToolbar />}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
          {location.pathname === "/" && (
            <Button
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={() => navigate("/projects")}
            >
              Мои презентации
            </Button>
          )}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LightModeIcon fontSize="small" />
            <Switch
              checked={colorMode === "dark"}
              onChange={(e) =>
                dispatch(setColorMode(e.target.checked ? "dark" : "light"))
              }
              color="default"
              inputProps={{ "aria-label": "theme switch" }}
            />
            <DarkModeIcon fontSize="small" />
          </Box>
        </Box>
      </Toolbar>
    </MotionAppBar>
  );
};
