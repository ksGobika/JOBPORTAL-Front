import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const API = axios.create({
  baseURL: API_BASE_URL,
});

export const authService = {
  login: (email) => API.get(`/users?email=${email}`),
  register: (userData) => API.post('/users', userData),
  updateProfile: (id, data) => API.patch(`/users/${id}`, data),
};

export const jobService = {
  getAllJobs: (status = '') => API.get(status ? `/jobs?status=${status}` : '/jobs'),
  getJobById: (id) => API.get(`/jobs/${id}`),
  postJob: (jobData) => API.post('/jobs', jobData),
  updateJob: (id, jobData) => API.patch(`/jobs/${id}`, jobData),
  updateJobStatus: (id, status) => API.patch(`/jobs/${id}`, { status }),
  deleteJob: (id) => API.delete(`/jobs/${id}`),
};

export const appService = {
  applyToJob: (appData) => API.post('/applications', appData),
  getApplicationsByUserId: (userId) => API.get(`/applications?seekerId=${userId}`),
  getApplicationsByEmployer: (empId) => API.get(`/applications?employerId=${empId}`),
  updateStatus: (id, status) => API.patch(`/applications/${id}`, { status }),
  deleteApplication: (id) => API.delete(`/applications/${id}`),
};

export const userService = {
  getUsers: (role) => API.get(role ? `/users?role=${role}` : '/users'),
  getUserById: (id) => API.get(`/users/${id}`),
};

export const messageService = {
  getMessages: (userId) => API.get(userId ? `/messages?senderId=${userId}` : '/messages'),
  getConversation: (user1, user2) => API.get(`/messages?senderId=${user1}&receiverId=${user2}`),
  sendMessage: (msgData) => API.post('/messages', msgData),
};

export const announcementService = {
  getAnnouncements: () => API.get('/announcements'),
  postAnnouncement: (data) => API.post('/announcements', data),
};

export const faqService = {
  getFaqs: () => API.get('/faqs'),
  postFaq: (data) => API.post('/faqs', data),
  deleteFaq: (id) => API.delete(`/faqs/${id}`),
};

export const reviewService = {
  getReviews: (empId) => API.get(empId ? `/reviews?employerId=${empId}` : '/reviews'),
  postReview: (data) => API.post('/reviews', data),
};

export const notificationService = {
  getNotifications: (userId) => API.get(userId ? `/notifications?userId=${userId}` : '/notifications'),
  markAsRead: (id) => API.patch(`/notifications/${id}`, { isRead: true }),
};

export const courseService = {
  getAllCourses: (category = '', employerId = '') => {
    let url = '/courses';
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (employerId) params.append('employerId', employerId);
    const queryString = params.toString();
    return API.get(queryString ? `${url}?${queryString}` : url);
  },
  getCourseById: (id) => API.get(`/courses/${id}`),
  createCourse: (courseData) => API.post('/courses', courseData),
  updateCourse: (id, courseData) => API.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => API.delete(`/courses/${id}`),
};

export const enrollmentService = {
  getEnrollmentsBySeeker: (seekerId) => API.get(`/enrollments?seekerId=${seekerId}`),
  getEnrollmentsByEmployer: (empId) => API.get(`/enrollments?employerId=${empId}`),
  getEnrollmentStatus: (courseId, seekerId) => API.get(`/enrollments?courseId=${courseId}&seekerId=${seekerId}`),
  enroll: (data) => API.post('/enrollments', data),
  updateProgress: (id, data) => API.patch(`/enrollments/${id}`, data),
};

export default API;