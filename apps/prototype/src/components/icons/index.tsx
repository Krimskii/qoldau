/**
 * Unified icon layer для Qoldau AI.
 *
 * Re-exports:
 * - Brand / specialist icons (logo, voice, timeline, aac, calm)
 * - Flat SVG icon set (~50 иконок в одном стиле)
 * - lucide-react pass-through
 */

// Brand / specialist icons
export {
  QoldauLogoMark,
  QoldauLogoLockup,
  VoiceWaveIcon,
  EventTimelineIcon,
  AACCardIcon,
  CalmModeIcon,
} from './brand';

// Flat SVG icons (currentColor, 32x32 viewBox)
export * from './flat.tsx';

// Soft 3D PNG assets (ChatGPT-generated, transparent background)
export * from './soft3d';

// Convenience: lucide-react common icons
export {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Plus,
  Minus,
  Search,
  Settings,
  Bell,
  Home,
  Calendar,
  MessageCircle,
  BarChart3,
  User,
  FileText,
  Brain,
  Heart,
  Eye,
  ArrowLeft,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  Play,
  Pause,
  Trash2,
  Edit,
  Save,
  Copy,
  Send,
  Filter,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  Star,
  Trophy,
  Sparkles,
  Sunrise,
  Moon,
  Sun,
} from 'lucide-react';

// Re-export IconProps type from flat set
export type { IconProps } from './flat';