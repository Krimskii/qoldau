import { UserRole } from '@/types/qoldau';

/**
 * RouteMeta — единое описание всех экранов приложения.
 *
 * Используется:
 * - BottomNav (скрывать nav-bar для focus-экранов).
 * - BackButton (знать fallback если browser history пуст).
 * - PageScaffold (max-width, padding, header layout).
 * - DemoIndicator (знать demo step).
 */

export type RouteVariant = 'phone' | 'tablet' | 'full';

export interface RouteMeta {
  path: string;
  /** Human-readable title для бэйджей, breadcrumbs. */
  title: string;
  role: UserRole;
  /**
   * Показывать ли BottomNav.
   * Focus-экраны (recording, full-screen modals) скрывают nav.
   */
  showBottomNav: boolean;
  /** Показывать ли стандартный AppShell header (Домой + уведомления). */
  showAppHeader: boolean;
  /**
   * Куда отправлять пользователя, если browser history пуст.
   * Например, если открыли страницу по прямой ссылке.
   */
  fallbackPath: string;
  /** Variant для max-width страницы (phone / tablet / full). */
  variant: RouteVariant;
  /** Номер шага в Guided Demo, если этот экран в демо. */
  demoStep?: number;
  /** Back chip hint — например, "Домой" для child, "Назад" для остальных. */
  backLabel?: string;
}

export const ROLE_HOME: Record<UserRole, string> = {
  overview: '/overview',
  parent: '/parent/home',
  child: '/child/home',
  tutor: '/tutor/home',
  specialist: '/specialist/dashboard',
};

/**
 * Список всех routes.
 * Чтобы добавить новый route — добавь RouteMeta сюда + Route в router.tsx.
 */
export const ROUTES: RouteMeta[] = [
  // ===== Overview (v0.6.2: landing restored) =====
  {
    path: '/overview',
    title: 'Главная',
    role: 'overview',
    showBottomNav: false,
    showAppHeader: false,
    fallbackPath: '/overview',
    variant: 'full',
  },

  // ===== Parent =====
  {
    path: '/parent/home',
    title: 'Главная',
    role: 'parent',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/parent/home',
    variant: 'phone',
  },
  {
    path: '/parent/voice',
    title: 'Голосовое наблюдение',
    role: 'parent',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/parent/home',
    variant: 'phone',
  },
  {
    path: '/parent/ai-review',
    title: 'AI-разбор',
    role: 'parent',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/parent/home',
    variant: 'phone',
  },
  {
    path: '/parent/clarify',
    title: 'Уточняем',
    role: 'parent',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/parent/home',
    variant: 'phone',
  },
  {
    path: '/parent/events',
    title: 'События',
    role: 'parent',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/parent/events',
    variant: 'phone',
  },
  {
    path: '/parent/events/:eventId',
    title: 'Детали события',
    role: 'parent',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/parent/events',
    variant: 'phone',
    demoStep: 7,
  },
  {
    path: '/parent/care',
    title: 'Дневник ухода',
    role: 'parent',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/parent/home',
    variant: 'phone',
  },
  {
    path: '/parent/behavior',
    title: 'Поведение и сенсорика',
    role: 'parent',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/parent/home',
    variant: 'phone',
  },
  {
    path: '/parent/assistant',
    title: 'AI-помощник',
    role: 'parent',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/parent/home',
    variant: 'phone',
  },
  {
    path: '/parent/analytics',
    title: 'Аналитика',
    role: 'parent',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/parent/home',
    variant: 'phone',
  },
  {
    path: '/parent/profile',
    title: 'Профиль',
    role: 'parent',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/parent/home',
    variant: 'phone',
  },
  {
    path: '/parent/notifications',
    title: 'Уведомления',
    role: 'parent',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/parent/home',
    variant: 'phone',
  },

  // ===== Child =====
  {
    path: '/child/home',
    title: 'Главная',
    role: 'child',
    showBottomNav: false, // bottom nav disabled per spec for child UI
    showAppHeader: true,
    fallbackPath: '/child/home',
    variant: 'phone',
    demoStep: 2,
    backLabel: 'Домой',
  },
  {
    path: '/child/cards',
    title: 'Карточки',
    role: 'child',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/child/home',
    variant: 'phone',
    backLabel: 'Домой',
  },
  {
    path: '/child/favorites',
    title: 'Любимые',
    role: 'child',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/child/home',
    variant: 'phone',
    backLabel: 'Домой',
  },
  {
    path: '/child/speak',
    title: 'Сказать',
    role: 'child',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/child/home',
    variant: 'phone',
    backLabel: 'Домой',
  },
  {
    path: '/child/phrase-builder',
    title: 'Собрать фразу',
    role: 'child',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/child/home',
    variant: 'phone',
    backLabel: 'Домой',
  },
  {
    path: '/child/calm',
    title: 'Спокойный режим',
    role: 'child',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/child/home',
    variant: 'phone',
    backLabel: 'Домой',
  },
  {
    path: '/child/now-next',
    title: 'Сейчас и потом',
    role: 'child',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/child/home',
    variant: 'phone',
    backLabel: 'Домой',
  },
  {
    path: '/child/choice',
    title: 'Выбрать из вариантов',
    role: 'child',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/child/home',
    variant: 'phone',
    backLabel: 'Домой',
  },
  {
    path: '/child/interface-guide',
    title: 'Что важно в интерфейсе',
    role: 'child',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/child/home',
    variant: 'phone',
    backLabel: 'Домой',
  },
  {
    path: '/child/call',
    title: 'Позвать',
    role: 'child',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/child/home',
    variant: 'phone',
    backLabel: 'Домой',
  },
  {
    path: '/child/progress',
    title: 'Мой прогресс',
    role: 'child',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/child/home',
    variant: 'phone',
    backLabel: 'Домой',
  },

  // ===== Tutor =====
  {
    path: '/tutor/home',
    title: 'Главная тьютора',
    role: 'tutor',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/tutor/home',
    variant: 'phone',
    demoStep: 13,
  },
  {
    path: '/tutor/voice',
    title: 'Запись наблюдения',
    role: 'tutor',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/tutor/home',
    variant: 'phone',
  },
  {
    path: '/tutor/ai-review',
    title: 'AI-разбор',
    role: 'tutor',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/tutor/home',
    variant: 'phone',
    demoStep: 14,
  },
  {
    path: '/tutor/report',
    title: 'Отчёт тьютора',
    role: 'tutor',
    showBottomNav: false,
    showAppHeader: true,
    fallbackPath: '/tutor/home',
    variant: 'phone',
    demoStep: 15,
  },
  {
    path: '/tutor/child-profile',
    title: 'Профиль ребёнка',
    role: 'tutor',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/tutor/home',
    variant: 'phone',
  },

  // ===== Specialist =====
  {
    path: '/specialist/dashboard',
    title: 'Панель специалиста',
    role: 'specialist',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/specialist/dashboard',
    variant: 'tablet',
    demoStep: 16,
  },
  {
    path: '/specialist/events',
    title: 'События',
    role: 'specialist',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/specialist/dashboard',
    variant: 'tablet',
  },
  {
    path: '/specialist/abc',
    title: 'ABC-анализ',
    role: 'specialist',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/specialist/dashboard',
    variant: 'tablet',
  },
  {
    path: '/specialist/communication-profile',
    title: 'Профиль коммуникации',
    role: 'specialist',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/specialist/dashboard',
    variant: 'tablet',
    demoStep: 17,
  },
  {
    path: '/specialist/care-patterns',
    title: 'Паттерны ухода',
    role: 'specialist',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/specialist/dashboard',
    variant: 'tablet',
  },
  {
    path: '/specialist/support-plan',
    title: 'План поддержки',
    role: 'specialist',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/specialist/dashboard',
    variant: 'tablet',
  },
  {
    path: '/specialist/reports',
    title: 'Отчёты',
    role: 'specialist',
    showBottomNav: true,
    showAppHeader: true,
    fallbackPath: '/specialist/dashboard',
    variant: 'tablet',
  },
];

// =============================================================================
// Helpers
// =============================================================================

/**
 * Резолвит route meta с поддержкой параметров (например, /parent/events/:eventId).
 */
export function getRouteMeta(pathname: string): RouteMeta | undefined {
  // Прямое совпадение
  const direct = ROUTES.find((r) => r.path === pathname);
  if (direct) return direct;

  // Совпадение по паттерну с параметрами
  for (const route of ROUTES) {
    if (route.path.includes(':')) {
      const regex = new RegExp(
        '^' + route.path.replace(/:[^/]+/g, '[^/]+') + '$',
      );
      if (regex.test(pathname)) return route;
    }
  }

  return undefined;
}

/**
 * Возвращает fallback path для текущего pathname.
 * Используется в BackButton, если browser history пуст.
 */
export function getFallbackPath(pathname: string): string {
  const meta = getRouteMeta(pathname);
  if (meta) return meta.fallbackPath;

  // Если pathname не в списке — fallback на landing /overview
  // (например, /unknown → /overview)
  return '/overview';
}

/**
 * Возвращает home для role.
 */
export function getRoleHome(role: UserRole): string {
  return ROLE_HOME[role] ?? '/overview';
}

/**
 * Возвращает все routes для конкретной role.
 */
export function getRoutesByRole(role: UserRole): RouteMeta[] {
  return ROUTES.filter((r) => r.role === role);
}

/**
 * Возвращает routes, которые показывают BottomNav для конкретной role.
 */
export function getNavRoutesByRole(role: UserRole): RouteMeta[] {
  return ROUTES.filter((r) => r.role === role && r.showBottomNav);
}