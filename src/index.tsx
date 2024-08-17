/* @refresh reload */
import { render } from "solid-js/web";

import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import App from "./app.tsx";
import "./styles/main.scss";

const queryClient = new QueryClient();

const root = document.getElementById("root");

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <App />
      <SolidQueryDevtools />
    </QueryClientProvider>
  ),
  root!
);
