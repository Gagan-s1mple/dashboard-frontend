"use client";

import { useEffect } from "react";
import { useLoginStore } from "@/src/services/api/login/login-store";

export default function AuthHydration() {
  const hydrate = useLoginStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
