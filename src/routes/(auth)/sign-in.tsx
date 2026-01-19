import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { LoginForm } from "~/components/login-form";

export const Route = createFileRoute("/(auth)/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoginForm />
    </div>
  );
}
