import React, { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DemoIndicator } from '@/components/layout/DemoIndicator';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { PageLoader } from '@/components/ui/PageLoader';
import { useAuthStore } from '@/store/useAuthStore';
import { useSyncStore } from '@/store/useSyncStore';
import { registerAuthGetter, register401Handler, registerRefreshHandler, registerLogoutHandler } from '@/api/client';
import { syncAll, SYNC_ENABLED, wireSyncTriggers } from '@/lib/sync/syncService';

// Parent Pages (eager — small, frequently visited)
import { ParentHome } from '@/pages/parent/ParentHome';
import { EventTimeline } from '@/pages/parent/EventTimeline';
import { EventDetails } from '@/pages/parent/EventDetails';
import { CareDiary } from '@/pages/parent/CareDiary';
import { BehaviorSensory } from '@/pages/parent/BehaviorSensory';
import { ParentAIChat } from '@/pages/parent/ParentAIChat';
import { ParentAnalytics } from '@/pages/parent/ParentAnalytics';
import { ParentProfile } from '@/pages/parent/ParentProfile';
import { ParentNotifications } from '@/pages/parent/ParentNotifications';
import { ClarifyingQuestions } from '@/pages/parent/ClarifyingQuestions';

// Parent Pages (lazy — large/heavy)
const VoiceObservation = lazy(() => import('@/pages/parent/VoiceObservation').then((m) => ({ default: m.VoiceObservation })));
const AIReview = lazy(() => import('@/pages/parent/AIReview').then((m) => ({ default: m.AIReview })));

// Child Pages (eager)
import { ChildHome } from '@/pages/child/ChildHome';
import { ChildFavorites } from '@/pages/child/ChildFavorites';
import { ChildSpeak } from '@/pages/child/ChildSpeak';
import { CalmMode } from '@/pages/child/CalmMode';
import { NowNext } from '@/pages/child/NowNext';
import { ChildChoice } from '@/pages/child/ChildChoice';
import { ChildInterfaceGuide } from '@/pages/child/ChildInterfaceGuide';
import { ChildCall } from '@/pages/child/CallMom';
import { ChildProgress } from '@/pages/child/ChildProgress';
import { ChildWater } from '@/pages/child/ChildWater';
import { ChildFood } from '@/pages/child/ChildFood';
import { ChildToilet } from '@/pages/child/ChildToilet';
import { ChildCategoryPage } from '@/pages/child/ChildCategoryPage';

// Child Pages (lazy — крупные)
const ChildCards = lazy(() => import('@/pages/child/ChildCards').then((m) => ({ default: m.ChildCards })));
const PhraseBuilderPage = lazy(() => import('@/pages/child/PhraseBuilderPage').then((m) => ({ default: m.PhraseBuilderPage })));

// Tutor Pages
import { TutorHome } from '@/pages/tutor/TutorHome';
import { TutorVoice } from '@/pages/tutor/TutorVoice';
import { TutorAIReview } from '@/pages/tutor/TutorAIReview';
import { TutorReport } from '@/pages/tutor/TutorReport';
import { TutorChildProfile } from '@/pages/tutor/TutorChildProfile';

// Specialist Pages
import { SpecialistDashboard } from '@/pages/specialist/SpecialistDashboard';
import { SpecialistEvents } from '@/pages/specialist/SpecialistEvents';
import { ABCAnalysis } from '@/pages/specialist/ABCAnalysis';
import { CommunicationProfile } from '@/pages/specialist/CommunicationProfile';
import { CarePatterns } from '@/pages/specialist/CarePatterns';
import { SupportPlan } from '@/pages/specialist/SupportPlan';
import { Reports } from '@/pages/specialist/Reports';

// Overview / Auth / Errors
import { LoginPage } from '@/pages/auth/LoginPage';
import { VerifyPage } from '@/pages/auth/VerifyPage';
import { Overview } from '@/pages/overview/Overview';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

/**
 * v1.5+ E7.5 auth-ready: маленький компонент, который регистрирует JWT getter
 * и 401-handler в api/client.ts, а также подтягивает сохранённую auth-сессию
 * из localStorage при старте приложения. Живёт ВНУТРИ HashRouter (нужен
 * useNavigate для редиректа на /auth/login при 401).
 *
 * В demo-режиме (VITE_REQUIRE_AUTH=false) — просто инициализирует state,
 * но НЕ редиректит на 401 (handlers.noop).
 */
const AppInit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initAuth = useAuthStore((s) => s.init);
  const logout = useAuthStore((s) => s.logout);
  const authStatus = useAuthStore((s) => s.status);

  useEffect(() => {
    // v1.6 E9.2: подключаем useEventStore → syncService (без circular).
    wireSyncTriggers();
    // Регистрируем getter JWT — теперь каждый fetch в api/client.ts будет
    // автоматически подмешивать Authorization: Bearer <jwt>.
    registerAuthGetter(() => useAuthStore.getState().jwt);
    // v1.6 E9.1: refresh-handler — api/client.ts вызовет его при 401 (один раз
    // на группу параллельных запросов), чтобы обновить access JWT через
    // refresh-токен без пере-логина.
    registerRefreshHandler(() => useAuthStore.getState().refresh());
    // logout-handler — вызывается если refresh не сработал. Чистим сессию и
    // редиректим на /auth/login (если REQUIRE_AUTH).
    registerLogoutHandler(async () => {
      await useAuthStore.getState().logout();
      useSyncStore.getState().reset();
      if (!location.pathname.startsWith('/auth/')) {
        const returnTo = location.pathname + location.search;
        navigate(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
      }
    });
    // Регистрируем 401-handler — мягкий редирект на /auth/login с returnTo.
    register401Handler((_path) => {
      if (!location.pathname.startsWith('/auth/')) {
        const returnTo = location.pathname + location.search;
        navigate(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
      }
    });
    // Подтягиваем сохранённую сессию (best-effort, не блокирует UI).
    void initAuth();
  }, [initAuth, navigate, location.pathname, location.search]);

  // Подписываемся на logout — очищаем store, не делаем редирект.
  useEffect(() => {
    void logout;
  }, [logout]);

  // v1.6 E9.2: триггер sync при логине (authStatus → authenticated).
  // syncAll запускает push→pull для всех childIds юзера.
  useEffect(() => {
    if (authStatus === 'authenticated' && SYNC_ENABLED) {
      void syncAll();
    }
  }, [authStatus]);

  return null;
};

export const AppRoutes: React.FC = () => {
  return (
    <HashRouter>
      <ErrorBoundary>
        <AppInit />
        <DemoIndicator />
        <ToastContainer />
        <Routes>
        {/* Landing (v0.6.2): выбор роли + запуск демо */}
        <Route path="/overview" element={<Overview />} />

        {/* Auth (v0.6.0) */}
        <Route
          path="/auth/login"
          element={<AppShell showNav={false}><LoginPage /></AppShell>}
        />
        <Route
          path="/auth/verify"
          element={<AppShell showNav={false}><VerifyPage /></AppShell>}
        />

        {/* 404 (v0.6.3) */}
        <Route path="/404" element={<NotFoundPage />} />

        {/* Parent Routes */}
        <Route
          path="/parent/home"
          element={<AppShell><ParentHome /></AppShell>}
        />
        <Route
          path="/parent/voice"
          element={<AppShell showNav={false}><Suspense fallback={<PageLoader />}><VoiceObservation /></Suspense></AppShell>}
        />
        <Route
          path="/parent/ai-review"
          element={<AppShell showNav={false}><Suspense fallback={<PageLoader />}><AIReview /></Suspense></AppShell>}
        />
        <Route
          path="/parent/clarify"
          element={<AppShell showNav={false}><ClarifyingQuestions /></AppShell>}
        />
        <Route
          path="/parent/events"
          element={<AppShell><EventTimeline /></AppShell>}
        />
        <Route
          path="/parent/events/:eventId"
          element={<AppShell><EventDetails /></AppShell>}
        />
        <Route
          path="/parent/care"
          element={<AppShell><CareDiary /></AppShell>}
        />
        <Route
          path="/parent/behavior"
          element={<AppShell><BehaviorSensory /></AppShell>}
        />
        <Route
          path="/parent/assistant"
          element={<AppShell showNav={false}><ParentAIChat /></AppShell>}
        />
        <Route
          path="/parent/analytics"
          element={<AppShell><ParentAnalytics /></AppShell>}
        />
        <Route
          path="/parent/profile"
          element={<AppShell><ParentProfile /></AppShell>}
        />
        <Route
          path="/parent/notifications"
          element={<AppShell><ParentNotifications /></AppShell>}
        />

        {/* Child Routes */}
        <Route
          path="/child/home"
          element={<AppShell><ChildHome /></AppShell>}
        />
        <Route
          path="/child/cards"
          element={<AppShell><Suspense fallback={<PageLoader />}><ChildCards /></Suspense></AppShell>}
        />
        <Route
          path="/child/favorites"
          element={<AppShell><ChildFavorites /></AppShell>}
        />
        <Route
          path="/child/speak"
          element={<AppShell><ChildSpeak /></AppShell>}
        />
        <Route
          path="/child/phrase-builder"
          element={<AppShell><Suspense fallback={<PageLoader />}><PhraseBuilderPage /></Suspense></AppShell>}
        />
        <Route
          path="/child/calm"
          element={<AppShell><CalmMode /></AppShell>}
        />
        <Route
          path="/child/now-next"
          element={<AppShell><NowNext /></AppShell>}
        />
        <Route
          path="/child/choice"
          element={<AppShell><ChildChoice /></AppShell>}
        />
        <Route
          path="/child/interface-guide"
          element={<AppShell><ChildInterfaceGuide /></AppShell>}
        />
        <Route
          path="/child/call"
          element={<AppShell><ChildCall /></AppShell>}
        />
        <Route
          path="/child/progress"
          element={<AppShell><ChildProgress /></AppShell>}
        />
        <Route
          path="/child/water"
          element={<AppShell><ChildWater /></AppShell>}
        />
        <Route
          path="/child/food"
          element={<AppShell><ChildFood /></AppShell>}
        />
        <Route
          path="/child/toilet"
          element={<AppShell><ChildToilet /></AppShell>}
        />
        <Route
          path="/child/category/:categoryId"
          element={<AppShell><ChildCategoryPage /></AppShell>}
        />

        {/* Tutor Routes */}
        <Route
          path="/tutor/home"
          element={<AppShell><TutorHome /></AppShell>}
        />
        <Route
          path="/tutor/voice"
          element={<AppShell showNav={false}><TutorVoice /></AppShell>}
        />
        <Route
          path="/tutor/ai-review"
          element={<AppShell showNav={false}><TutorAIReview /></AppShell>}
        />
        <Route
          path="/tutor/report"
          element={<AppShell showNav={false}><TutorReport /></AppShell>}
        />
        <Route
          path="/tutor/child-profile"
          element={<AppShell><TutorChildProfile /></AppShell>}
        />
        {/* Tutor event details (alias of parent route — единый EventDetails) */}
        <Route
          path="/tutor/events/:eventId"
          element={<AppShell><EventDetails /></AppShell>}
        />

        {/* Specialist Routes */}
        <Route
          path="/specialist/dashboard"
          element={<AppShell><SpecialistDashboard /></AppShell>}
        />
        <Route
          path="/specialist/events"
          element={<AppShell><SpecialistEvents /></AppShell>}
        />
        {/* Specialist event details (alias of parent route — единый EventDetails) */}
        <Route
          path="/specialist/events/:eventId"
          element={<AppShell><EventDetails /></AppShell>}
        />
        <Route
          path="/specialist/abc"
          element={<AppShell><ABCAnalysis /></AppShell>}
        />
        <Route
          path="/specialist/communication-profile"
          element={<AppShell><CommunicationProfile /></AppShell>}
        />
        <Route
          path="/specialist/care-patterns"
          element={<AppShell><CarePatterns /></AppShell>}
        />
        <Route
          path="/specialist/support-plan"
          element={<AppShell><SupportPlan /></AppShell>}
        />
        <Route
          path="/specialist/reports"
          element={<AppShell><Reports /></AppShell>}
        />

        {/* Default redirect (v0.6.3: '/' → landing, '*' → 404 page) */}
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
};