import api from './api';

export const notificationService = {
  getMedicineReminders: () => api.get('/reminders/medicine'),
  createMedicineReminder: (data) => api.post('/reminders/medicine', data),
  updateMedicineReminder: (id, data) => api.put(`/reminders/medicine/${id}`, data),
  deleteMedicineReminder: (id) => api.delete(`/reminders/medicine/${id}`),
  getNotifications: (unreadOnly = false) => api.get(`/reminders/notifications?unread_only=${unreadOnly}`),
  markRead: (id) => api.post(`/reminders/notifications/${id}/read`),
  markAllRead: () => api.post('/reminders/notifications/read-all'),
  saveFcmToken: (fcmToken) => api.post('/reminders/fcm', { fcm_token: fcmToken }),
};

export default notificationService;
