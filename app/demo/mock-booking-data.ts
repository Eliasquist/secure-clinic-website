import { DateTime } from 'luxon';

export interface MockService {
    name: string;
    durationMinutes: number;
}

export interface MockProvider {
    name: string;
}

export interface MockPatient {
    firstName: string;
    lastName: string;
}

export interface MockBooking {
    id: string;
    patientName: string;
    service: MockService;
    startTime: string;
    status: 'PENDING_APPROVAL' | 'HELD' | 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
    provider: MockProvider;
    patientPhone: string;
    patientEmail: string;
    patient?: MockPatient;
}

// Generate mock bookings with realistic data
export const mockBookings: MockBooking[] = [
    {
        id: '1',
        patientName: 'Anna Larsen',
        service: { name: 'Botox (3 områder)', durationMinutes: 45 },
        startTime: DateTime.now().set({ hour: 9, minute: 0 }).toISO()!,
        status: 'CONFIRMED',
        provider: { name: 'Dr. House' },
        patientPhone: '+47 123 45 678',
        patientEmail: 'anna.larsen@example.com',
        patient: { firstName: 'Anna', lastName: 'Larsen' }
    },
    {
        id: '2',
        patientName: 'Erik Johansen',
        service: { name: 'Filler (Lepper 1ml)', durationMinutes: 45 },
        startTime: DateTime.now().set({ hour: 10, minute: 30 }).toISO()!,
        status: 'HELD',
        provider: { name: 'Dr. House' },
        patientPhone: '+47 987 65 432',
        patientEmail: 'erik.j@example.com',
    },
    {
        id: '3',
        patientName: 'Kari Olsen',
        service: { name: 'Konsultasjon', durationMinutes: 30 },
        startTime: DateTime.now().set({ hour: 14, minute: 0 }).toISO()!,
        status: 'CONFIRMED',
        provider: { name: 'Dr. House' },
        patientPhone: '+47 555 12 345',
        patientEmail: 'kari.olsen@example.com',
    },
    {
        id: '4',
        patientName: 'Ole Hansen',
        service: { name: 'Botox (Panne)', durationMinutes: 30 },
        startTime: DateTime.now().plus({ days: 1 }).set({ hour: 11, minute: 0 }).toISO()!,
        status: 'CONFIRMED',
        provider: { name: 'Dr. House' },
        patientPhone: '+47 444 33 222',
        patientEmail: 'ole.h@example.com',
        patient: { firstName: 'Ole', lastName: 'Hansen' }
    },
    {
        id: '5',
        patientName: 'Maria Berg',
        service: { name: 'Filler (Kinn)', durationMinutes: 60 },
        startTime: DateTime.now().plus({ days: 2 }).set({ hour: 13, minute: 30 }).toISO()!,
        status: 'PENDING_APPROVAL',
        provider: { name: 'Dr. House' },
        patientPhone: '+47 333 22 111',
        patientEmail: 'maria.berg@example.com',
    },
];
