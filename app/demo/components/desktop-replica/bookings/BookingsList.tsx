'use client';

import { DateTime } from 'luxon';
import { MockBooking } from '../../../mock-booking-data';

interface BookingsListProps {
    bookings: MockBooking[];
    onSelect: (booking: MockBooking) => void;
}

const STATUS_COLORS = {
    PENDING_APPROVAL: 'bg-blue-100 text-blue-800',
    HELD: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    NO_SHOW: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS = {
    PENDING_APPROVAL: 'Venter godkjenning',
    HELD: 'Ventende',
    CONFIRMED: 'Bekreftet',
    COMPLETED: 'Fullført',
    NO_SHOW: 'Ikke møtt',
    CANCELLED: 'Avbestilt',
};

export function BookingsList({ bookings, onSelect }: BookingsListProps) {
    if (bookings.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-900">Ingen bookinger funnet</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Prøv å endre filtere eller datointervall
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {bookings.map((booking) => {
                const startTime = DateTime.fromISO(booking.startTime);
                const isToday = startTime.hasSame(DateTime.now(), 'day');

                return (
                    <button
                        key={booking.id}
                        onClick={() => onSelect(booking)}
                        className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {booking.patientName}
                                    </h3>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[booking.status]
                                            }`}
                                    >
                                        {STATUS_LABELS[booking.status]}
                                    </span>
                                    {isToday && (
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                            I dag
                                        </span>
                                    )}
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                    <div className="text-gray-600">
                                        <span className="font-medium">Behandling:</span>{' '}
                                        {booking.service.name}
                                    </div>
                                    <div className="text-gray-600">
                                        <span className="font-medium">Dato:</span>{' '}
                                        {startTime.toFormat('dd.MM.yyyy')}
                                    </div>
                                    <div className="text-gray-600">
                                        <span className="font-medium">Tid:</span>{' '}
                                        {startTime.toFormat('HH:mm')} ({booking.service.durationMinutes} min)
                                    </div>
                                    {booking.provider && (
                                        <div className="text-gray-600">
                                            <span className="font-medium">Behandler:</span>{' '}
                                            {booking.provider.name}
                                        </div>
                                    )}
                                    {booking.patientPhone && (
                                        <div className="text-gray-600">
                                            <span className="font-medium">Telefon:</span>{' '}
                                            {booking.patientPhone}
                                        </div>
                                    )}
                                    {booking.patientEmail && (
                                        <div className="text-gray-600">
                                            <span className="font-medium">E-post:</span>{' '}
                                            {booking.patientEmail}
                                        </div>
                                    )}
                                </div>

                                {booking.patient && (
                                    <div className="mt-2 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-900">
                                        ✓ Koblet til pasient: {booking.patient.firstName}{' '}
                                        {booking.patient.lastName}
                                    </div>
                                )}
                            </div>

                            <div className="ml-4">
                                <svg
                                    className="h-5 w-5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </button>
                );
            })}</div>
    );
}
