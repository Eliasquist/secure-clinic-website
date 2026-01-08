'use client';

import { useState, useCallback } from 'react';
import { DateTime } from 'luxon';
import { BookingsList } from './BookingsList';
import { MockBooking } from '../../../mock-booking-data';

interface BookingsPageReplicaProps {
    mockData: MockBooking[];
}

type ViewMode = 'list' | 'calendar';

export function BookingsPageReplica({ mockData }: BookingsPageReplicaProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [bookings, setBookings] = useState<MockBooking[]>(mockData);
    const [selectedBooking, setSelectedBooking] = useState<MockBooking | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState(
        DateTime.now().minus({ days: 7 }).toISODate() || '',
    );
    const [dateTo, setDateTo] = useState(
        DateTime.now().plus({ days: 30 }).toISODate() || '',
    );

    const filterBookings = useCallback(() => {
        let filtered = mockData;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(b => b.status === statusFilter);
        }

        // Filter by date range
        const fromDate = DateTime.fromISO(dateFrom);
        const toDate = DateTime.fromISO(dateTo);
        filtered = filtered.filter(b => {
            const bookingDate = DateTime.fromISO(b.startTime);
            return bookingDate >= fromDate && bookingDate <= toDate;
        });

        setBookings(filtered);
    }, [mockData, statusFilter, dateFrom, dateTo]);

    const handleRefresh = () => {
        filterBookings();
    };

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-semibold text-gray-900">Bookinger</h1>

                        {/* View Mode Toggle */}
                        <div className="flex rounded-lg border border-gray-300 bg-gray-50">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 text-sm font-medium ${viewMode === 'list'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    } rounded-l-lg`}
                            >
                                📋 Liste
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-4 py-2 text-sm font-medium ${viewMode === 'calendar'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    } rounded-r-lg`}
                            >
                                📅 Kalender
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            disabled
                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-not-allowed opacity-50"
                        >
                            Pasienter
                        </button>
                        <button
                            disabled
                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-not-allowed opacity-50"
                        >
                            Kalender
                        </button>
                        <button
                            disabled
                            className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 cursor-not-allowed opacity-50"
                        >
                            Logg ut
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Fra:</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Til:</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="all">Alle</option>
                            <option value="HELD">Ventende</option>
                            <option value="CONFIRMED">Bekreftet</option>
                            <option value="COMPLETED">Fullført</option>
                            <option value="NO_SHOW">Ikke møtt</option>
                            <option value="CANCELLED">Avbestilt</option>
                        </select>
                    </div>

                    <button
                        onClick={handleRefresh}
                        className="ml-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        🔄 Oppdater
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-6">
                {viewMode === 'list' ? (
                    <BookingsList
                        bookings={bookings}
                        onSelect={setSelectedBooking}
                    />
                ) : (
                    <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
                        <div className="text-center">
                            <p className="text-lg font-medium text-gray-900">Kalendervisning</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Kommer snart i demo-versjonen
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Simple modal for selected booking */}
            {selectedBooking && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setSelectedBooking(null)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {selectedBooking.patientName}
                        </h2>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Behandling:</span> {selectedBooking.service.name}</p>
                            <p><span className="font-medium">Tid:</span> {DateTime.fromISO(selectedBooking.startTime).toFormat('dd.MM.yyyy HH:mm')}</p>
                            <p><span className="font-medium">Varighet:</span> {selectedBooking.service.durationMinutes} min</p>
                            <p><span className="font-medium">Status:</span> {STATUS_LABELS[selectedBooking.status]}</p>
                            {selectedBooking.patientPhone && (
                                <p><span className="font-medium">Telefon:</span> {selectedBooking.patientPhone}</p>
                            )}
                            {selectedBooking.patientEmail && (
                                <p><span className="font-medium">E-post:</span> {selectedBooking.patientEmail}</p>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Lukk
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const STATUS_LABELS = {
    PENDING_APPROVAL: 'Venter godkjenning',
    HELD: 'Ventende',
    CONFIRMED: 'Bekreftet',
    COMPLETED: 'Fullført',
    NO_SHOW: 'Ikke møtt',
    CANCELLED: 'Avbestilt',
};
