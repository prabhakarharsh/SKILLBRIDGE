import { Suspense } from "react";
import { Auth } from "@/views/Auth";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <Auth />
    </Suspense>
  );
}
