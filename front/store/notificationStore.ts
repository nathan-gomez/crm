import { create } from 'zustand';

type NotificationState = {
  type: 'error' | 'warning' | 'success' | 'info' | '';
  message: string;
};

type NotificationAction = {
  updateNotification: (notification: NotificationState) => void;
};

type NotificationStore = NotificationState & { actions: NotificationAction };

const notificationStore = create<NotificationStore>()((set) => ({
  type: '',
  message: '',
  actions: {
    updateNotification: (notification) => set(() => notification),
  },
}));

export default notificationStore;
