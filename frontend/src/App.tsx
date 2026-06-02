import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import LandingPage from "@/pages/LandingPage";
import OnboardingPage from "@/pages/OnboardingPage";
import ChartPage from "@/pages/ChartPage";
import ChatPage from "@/pages/ChatPage";

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <LandingPage />
              </PageWrapper>
            }
          />
          <Route
            path="/onboard"
            element={
              <PageWrapper>
                <OnboardingPage />
              </PageWrapper>
            }
          />
          <Route
            path="/chart"
            element={
              <PageWrapper>
                <ChartPage />
              </PageWrapper>
            }
          />
          <Route
            path="/chat"
            element={
              <ChatPage />
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
