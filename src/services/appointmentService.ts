import authService from './authService';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export type AppointmentStatus =
  | 'Upcoming'
  | 'Attended'
  | 'Did not show up'
  | 'Cancelled';

export interface Appointment {
  id: string;
  userId: string;
  type: string;
  departmentDoctor: string;
  doctor: string;
  specialty: string;
  reason: string;
  notes: string;
  datetime: string;
  startISO: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

type CreateAppointmentInput = {
  type: string;
  departmentDoctor: string;
  reason: string;
  notes?: string;
  startsAt: string;
};

type UpdateAppointmentInput = Partial<CreateAppointmentInput> & {
  status?: AppointmentStatus;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_URL}/api/appointments${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({ message: 'Invalid server response' }));
  if (!response.ok) throw new Error(data.message || 'Appointment request failed');
  return data as T;
}

const appointmentService = {
  async list() {
    const result = await request<{ appointments: Appointment[] }>('/');
    return result.appointments;
  },

  async get(id: string) {
    const result = await request<{ appointment: Appointment }>(`/${id}`);
    return result.appointment;
  },

  async create(input: CreateAppointmentInput) {
    const result = await request<{ appointment: Appointment }>('/', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return result.appointment;
  },

  async update(id: string, input: UpdateAppointmentInput) {
    const result = await request<{ appointment: Appointment }>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return result.appointment;
  },

  async cancel(id: string) {
    const result = await request<{ appointment: Appointment }>(`/${id}`, {
      method: 'DELETE',
    });
    return result.appointment;
  },
};

export default appointmentService;
