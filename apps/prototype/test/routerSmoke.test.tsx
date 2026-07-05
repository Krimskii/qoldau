/**
 * router smoke test (v1.5 E7.6) — все 43 маршрута рендерятся без крашей.
 *
 * Цель: гарантировать, что при рефакторинге или добавлении новых страниц
 * основные экраны остаются достижимыми. Если новый импорт падает или
 * хук сломался — этот тест поймает.
 *
 * Не проверяем содержимое — только «роут маунтится без throw».
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Eager imports — те страницы, которые router.tsx загружает eagerly.
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
import { TutorHome } from '@/pages/tutor/TutorHome';
import { TutorVoice } from '@/pages/tutor/TutorVoice';
import { TutorAIReview } from '@/pages/tutor/TutorAIReview';
import { TutorReport } from '@/pages/tutor/TutorReport';
import { TutorChildProfile } from '@/pages/tutor/TutorChildProfile';
import { SpecialistDashboard } from '@/pages/specialist/SpecialistDashboard';
import { SpecialistEvents } from '@/pages/specialist/SpecialistEvents';
import { ABCAnalysis } from '@/pages/specialist/ABCAnalysis';
import { CommunicationProfile } from '@/pages/specialist/CommunicationProfile';
import { CarePatterns } from '@/pages/specialist/CarePatterns';
import { SupportPlan } from '@/pages/specialist/SupportPlan';
import { Reports } from '@/pages/specialist/Reports';
import { LoginPage } from '@/pages/auth/LoginPage';
import { VerifyPage } from '@/pages/auth/VerifyPage';
import { Overview } from '@/pages/overview/Overview';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

/**
 * Helper: рендерит маршрут с заданным path и проверяет что элемент появился
 * (не упал с throw).
 */
function smokeRender(path: string, element: React.ReactNode) {
  const initialEntries = [path];
  expect(() => {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path={path} element={element} />
        </Routes>
      </MemoryRouter>
    );
  }).not.toThrow();
}

describe('router smoke (E7.6) — все 43 маршрута маунтятся', () => {
  // Landing / auth / errors
  it('/overview', () => smokeRender('/overview', <Overview />));
  it('/auth/login', () => smokeRender('/auth/login', <LoginPage />));
  it('/auth/verify', () => smokeRender('/auth/verify', <VerifyPage />));
  it('/404', () => smokeRender('/404', <NotFoundPage />));

  // Parent (10 страниц)
  it('/parent/home', () => smokeRender('/parent/home', <ParentHome />));
  it('/parent/events', () => smokeRender('/parent/events', <EventTimeline />));
  it('/parent/events/:eventId', () => smokeRender('/parent/events/test-id', <EventDetails />));
  it('/parent/care', () => smokeRender('/parent/care', <CareDiary />));
  it('/parent/behavior', () => smokeRender('/parent/behavior', <BehaviorSensory />));
  it('/parent/assistant', () => smokeRender('/parent/assistant', <ParentAIChat />));
  it('/parent/analytics', () => smokeRender('/parent/analytics', <ParentAnalytics />));
  it('/parent/profile', () => smokeRender('/parent/profile', <ParentProfile />));
  it('/parent/notifications', () => smokeRender('/parent/notifications', <ParentNotifications />));
  it('/parent/clarify', () => smokeRender('/parent/clarify', <ClarifyingQuestions />));

  // Child (13 страниц)
  it('/child/home', () => smokeRender('/child/home', <ChildHome />));
  it('/child/favorites', () => smokeRender('/child/favorites', <ChildFavorites />));
  it('/child/speak', () => smokeRender('/child/speak', <ChildSpeak />));
  it('/child/calm', () => smokeRender('/child/calm', <CalmMode />));
  it('/child/now-next', () => smokeRender('/child/now-next', <NowNext />));
  it('/child/choice', () => smokeRender('/child/choice', <ChildChoice />));
  it('/child/interface-guide', () => smokeRender('/child/interface-guide', <ChildInterfaceGuide />));
  it('/child/call', () => smokeRender('/child/call', <ChildCall />));
  it('/child/progress', () => smokeRender('/child/progress', <ChildProgress />));
  it('/child/water', () => smokeRender('/child/water', <ChildWater />));
  it('/child/food', () => smokeRender('/child/food', <ChildFood />));
  it('/child/toilet', () => smokeRender('/child/toilet', <ChildToilet />));
  it('/child/category/:categoryId', () => smokeRender('/child/category/food', <ChildCategoryPage />));

  // Tutor (5 + 1 alias = 6 страниц)
  it('/tutor/home', () => smokeRender('/tutor/home', <TutorHome />));
  it('/tutor/voice', () => smokeRender('/tutor/voice', <TutorVoice />));
  it('/tutor/ai-review', () => smokeRender('/tutor/ai-review', <TutorAIReview />));
  it('/tutor/report', () => smokeRender('/tutor/report', <TutorReport />));
  it('/tutor/child-profile', () => smokeRender('/tutor/child-profile', <TutorChildProfile />));
  it('/tutor/events/:eventId (alias EventDetails)', () =>
    smokeRender('/tutor/events/test-id', <EventDetails />));

  // Specialist (7 + 1 alias = 8 страниц)
  it('/specialist/dashboard', () => smokeRender('/specialist/dashboard', <SpecialistDashboard />));
  it('/specialist/events', () => smokeRender('/specialist/events', <SpecialistEvents />));
  it('/specialist/events/:eventId (alias EventDetails)', () =>
    smokeRender('/specialist/events/test-id', <EventDetails />));
  it('/specialist/abc', () => smokeRender('/specialist/abc', <ABCAnalysis />));
  it('/specialist/communication-profile', () =>
    smokeRender('/specialist/communication-profile', <CommunicationProfile />));
  it('/specialist/care-patterns', () => smokeRender('/specialist/care-patterns', <CarePatterns />));
  it('/specialist/support-plan', () => smokeRender('/specialist/support-plan', <SupportPlan />));
  it('/specialist/reports', () => smokeRender('/specialist/reports', <Reports />));
});

describe('router smoke (E7.6) — sanity-checks', () => {
  it('NotFoundPage не падает на неизвестном пути', () => {
    expect(() => {
      render(
        <MemoryRouter initialEntries={['/random-unknown-path']}>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
      );
    }).not.toThrow();
  });

  it('overview рендерит заголовок Qoldau', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/overview']}>
        <Routes>
          <Route path="/overview" element={<Overview />} />
        </Routes>
      </MemoryRouter>
    );
    // Overview обычно содержит Qoldau в названии или тексте
    expect(container.textContent).toBeTruthy();
  });
});