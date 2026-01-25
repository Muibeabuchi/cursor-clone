import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { SignupForm } from "~/components/signup-form";

export const Route = createFileRoute("/(auth)/_auth-layout/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <SignupForm className="w-full max-w-5xl" />
    </div>
  );
}
