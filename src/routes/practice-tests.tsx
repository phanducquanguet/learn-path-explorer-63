import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/practice-tests")({
  component: () => <Outlet />,
});
