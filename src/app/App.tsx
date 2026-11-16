import { RouterProvider } from "react-router-dom";
import { OfflineProvider } from "@/features/offline/OfflineProvider";
import { router } from "./router";
import { ThemeProvider } from "./ThemeProvider";

export function App() {
  return (
    <ThemeProvider>
      <OfflineProvider>
        <RouterProvider router={router} />
      </OfflineProvider>
    </ThemeProvider>
  );
}
