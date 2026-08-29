import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/layout/Layout";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RedirectIfAuthenticated } from "./components/auth/RedirectIfAuthenticated";
import { Home } from "./pages/Home";
import { StoryDetail } from "./pages/StoryDetail";
import { MyStories } from "./pages/MyStories";
import { Bookmarks } from "./pages/Bookmarks";
import { Following } from "./pages/Following";
import { Write } from "./pages/Write";
import { PrivateProfile } from "./pages/PrivateProfile";
import { PublicProfile } from "./pages/PublicProfile";
import { FollowRequired } from "./pages/FollowRequired";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { ActivateAccount } from "./pages/ActivateAccount";
import { Settings } from "./pages/Settings";
import { ConfirmEmailChange } from "./pages/ConfirmEmailChange";
import { Help } from "./pages/Help";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/story/:slug" element={<StoryDetail />} />
            <Route path="/help" element={<Help />} />
            <Route element={<RequireAuth />}>
              <Route path="/my-stories" element={<MyStories />} />
              <Route path="/saved" element={<Bookmarks />} />
              <Route path="/following" element={<Following />} />
              <Route path="/profile" element={<PrivateProfile />} />
              <Route path="/write" element={<Write />} />
              <Route path="/write/:slug" element={<Write />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/follow-required" element={<FollowRequired />} />
            <Route path="/:username" element={<PublicProfile />} />
          </Route>

          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          </Route>

          <Route path="/activate/:uid/:token" element={<ActivateAccount />} />
          <Route path="/confirm-email/:uid/:token" element={<ConfirmEmailChange />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
