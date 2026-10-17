import { Suspense } from "react";
import { PostNeed } from "@/views/PostNeed";

export default function PostNeedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <PostNeed />
    </Suspense>
  );
}
