
import React from "react";
import { PageTransition } from "@/components/PageTransition";
import Index from "./Index";

// Simple wrapper component to add page transition to the Index page
export default function Home() {
  return (
    <PageTransition>
      <Index />
    </PageTransition>
  );
}
