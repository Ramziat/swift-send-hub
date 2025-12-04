export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const res = await Notification.requestPermission();
  return res === 'granted';
};

export const notifySuccess = async (title: string, body: string) => {
  try {
    const allowed = await requestNotificationPermission();
    if (!allowed) return;
    new Notification(title, { body });
    // Play notification sound
    const audio = new window.Audio('/notification.mp3');
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
};
