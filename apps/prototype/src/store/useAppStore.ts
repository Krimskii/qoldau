import { create } from 'zustand';
import { UserRole } from '@/types/qoldau';

interface AppState {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  recordingDuration: number;
  setRecordingDuration: (duration: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRole: 'parent',
  setCurrentRole: (role) => set({ currentRole: role }),
  isRecording: false,
  setIsRecording: (isRecording) => set({ isRecording }),
  recordingDuration: 0,
  setRecordingDuration: (recordingDuration) => set({ recordingDuration }),
}));
