'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TurnstileWidget } from '@/app/components/TurnstileWidget';
import { TestTubeIcon } from '@/app/icons';

interface ServiceCategory {
    slug: string;
    name: string;
    icon: string | null;
}

interface Service {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    price: string;
    category: ServiceCategory | null;
}

interface TimeSlot {
    startTime: string;
    endTime: string;
    providerId: string;
    providerName?: string;
}

interface ClinicInfo {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    bookingEnabled: boolean;
}

export default function BookingPage() {
    const params = useParams();
    const clinicSlug = params.clinicSlug as string;
    const isDemo = clinicSlug === 'demo-klinikk' || clinicSlug === 'oslo-demo';

    const [step, setStep] = useState<'service' | 'time' | 'details' | 'otp' | 'confirmed'>('service');
    const [clinic, setClinic] = useState<ClinicInfo | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [otp, setOtp] = useState('');
    const [bookingId, setBookingId] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [manageToken, setManageToken] = useState('');
    const [error, setError] = useState('');

    // Load clinic info
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/booking/clinic/${clinicSlug}`)
            .then((res) => res.json())
            .then((data) => {
                setClinic(data.clinic);
                setLoading(false);
            })
            .catch(() => {
                setError('Kunne ikke laste klinikkinfo');
                setLoading(false);
            });
    }, [clinicSlug]);

    // Load services
    useEffect(() => {
        if (clinic) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/booking/services?clinic=${clinicSlug}`)
                .then((res) => res.json())
                .then((data) => setServices(data.services))
                .catch(() => setError('Kunne ikke laste tjenester'));
        }
    }, [clinic, clinicSlug]);

    // Load time slots when service and date selected
    useEffect(() => {
        if (selectedService && selectedDate) {
            const from = new Date(selectedDate);
            from.setHours(0, 0, 0, 0);
            const to = new Date(selectedDate);
            to.setHours(23, 59, 59, 999);

            fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/public/booking/slots?` +
                `clinic=${clinicSlug}&serviceId=${selectedService.id}&` +
                `from=${from.toISOString()}&to=${to.toISOString()}`
            )
                .then((res) => res.json())
                .then((data) => setSlots(data.slots || []))
                .catch(() => setError('Kunne ikke laste ledige tider'));
        }
    }, [selectedService, selectedDate, clinicSlug]);

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service);
        setStep('time');
    };

    const handleTimeSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot);
        setStep('details');
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!turnstileToken) {
            setError('Vennligst fullfør verifiseringen');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/booking/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clinicSlug,
                    serviceId: selectedService!.id,
                    startTime: selectedSlot!.startTime,
                    providerId: selectedSlot!.providerId,
                    patientName,
                    patientPhone,
                    patientEmail,
                    turnstileToken,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setBookingId(data.bookingId);
                setExpiresAt(data.expiresAt);
                setStep('otp');
            } else {
                setError(data.message || 'Kunne ikke opprette booking');
            }
        } catch {
            setError('Nettverksfeil. Prøv igjen.');
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/booking/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    otp,
                    turnstileToken,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setManageToken(data.manageToken);
                setStep('confirmed');
            } else {
                setError(data.message || 'Ugyldig kode');
            }
        } catch {
            setError('Nettverksfeil. Prøv igjen.');
        }
    };

    const stepLabels = ['Tjeneste', 'Tid', 'Detaljer', 'Bekreft', 'Ferdig'];
    const stepIndex = ['service', 'time', 'details', 'otp', 'confirmed'].indexOf(step);

    if (loading) {
        return (
            <div className="booking-page">
                <div className="booking-container">
                    <div className="booking-loading">
                        <div className="loading-spinner"></div>
                        <p>Laster...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!clinic || !clinic.bookingEnabled) {
        return (
            <div className="booking-page">
                <div className="booking-container">
                    <div className="booking-error-state">
                        <div className="error-icon">🏥</div>
                        <h1>Booking ikke tilgjengelig</h1>
                        <p>Online booking er ikke aktivert for denne klinikken.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="booking-container">
                {/* Demo Banner */}
                {/* Demo Banner - Updated to neutral blue theme */}
                <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 text-sm text-blue-800">
                    <span className="text-blue-500 mt-0.5">
                        <TestTubeIcon />
                    </span>
                    <div className="flex flex-col">
                        <strong className="font-semibold text-base mb-1">Dette er en demo</strong>
                        <span className="text-blue-600 leading-relaxed">Utforsk hvordan booking-systemet fungerer. Ingen ekte avtaler opprettes.</span>
                    </div>
                </div>

                {/* Header */}
                <div className="booking-header">
                    <h1>{clinic.name}</h1>
                    {clinic.address && <p className="clinic-address">📍 {clinic.address}</p>}
                </div>

                {/* Progress Steps */}
                <div className="booking-progress">
                    {stepLabels.map((label, i) => (
                        <div key={label} className={`progress-step ${i <= stepIndex ? 'active' : ''} ${i < stepIndex ? 'completed' : ''}`}>
                            <div className="step-number">
                                {i < stepIndex ? '✓' : i + 1}
                            </div>
                            <span className="step-label">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Error message */}
                {error && (
                    <div className="booking-error">
                        <span>⚠️</span> {error}
                        <button onClick={() => setError('')}>×</button>
                    </div>
                )}

                {/* Step content */}
                <div className="booking-card">
                    {step === 'service' && (
                        <div className="booking-step">
                            <h2>Velg behandling</h2>
                            <p className="step-description">Velg hvilken tjeneste du ønsker å bestille</p>
                            <div className="service-grid">
                                {/* Group services by category */}
                                {(() => {
                                    const grouped: { [key: string]: { category: ServiceCategory | null; services: Service[] } } = {};
                                    services.forEach((service) => {
                                        const key = service.category?.slug || 'other';
                                        if (!grouped[key]) {
                                            grouped[key] = { category: service.category, services: [] };
                                        }
                                        grouped[key].services.push(service);
                                    });
                                    return Object.entries(grouped).map(([key, group]) => (
                                        <div key={key} className="service-category-group">
                                            {group.category && (
                                                <div className="category-header">
                                                    <span className="category-icon">{group.category.icon}</span>
                                                    <span className="category-name">{group.category.name}</span>
                                                </div>
                                            )}
                                            {group.services.map((service) => (
                                                <button
                                                    key={service.id}
                                                    onClick={() => handleServiceSelect(service)}
                                                    className="service-card"
                                                >
                                                    <div className="service-info">
                                                        <h3>{service.name}</h3>
                                                        {service.description && (
                                                            <p className="service-description">{service.description}</p>
                                                        )}
                                                        <div className="service-meta">
                                                            <span className="service-duration">🕐 {service.durationMinutes} min</span>
                                                        </div>
                                                    </div>
                                                    <div className="service-price">
                                                        {service.price.replace(' NOK', '')}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    )}

                    {step === 'time' && selectedService && (
                        <div className="booking-step">
                            <h2>Velg tid</h2>
                            <div className="selected-service-badge">
                                {selectedService.name} • {selectedService.durationMinutes} min
                            </div>

                            <div className="date-picker-section">
                                <label>Velg dato</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={selectedDate.toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    className="date-input"
                                />
                            </div>

                            <div className="time-slots-section">
                                <label>Ledige tider</label>
                                {slots.length === 0 ? (
                                    <div className="no-slots">
                                        <span>📅</span>
                                        <p>Ingen ledige tider denne dagen</p>
                                        <p className="hint">Prøv en annen dato</p>
                                    </div>
                                ) : (
                                    <div className="time-slots-grid">
                                        {slots.map((slot, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleTimeSelect(slot)}
                                                className="time-slot"
                                            >
                                                {new Date(slot.startTime).toLocaleTimeString('no-NO', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setStep('service')} className="back-button">
                                ← Tilbake til tjenester
                            </button>
                        </div>
                    )}

                    {step === 'details' && (
                        <div className="booking-step">
                            <h2>Dine opplysninger</h2>
                            <p className="step-description">Fyll inn kontaktinformasjon for bekreftelse</p>

                            <form onSubmit={handleDetailsSubmit} className="booking-form">
                                <div className="form-group">
                                    <label>Navn *</label>
                                    <input
                                        type="text"
                                        required
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="Ditt fulle navn"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Telefon</label>
                                    <input
                                        type="tel"
                                        value={patientPhone}
                                        onChange={(e) => setPatientPhone(e.target.value)}
                                        placeholder="+47 XXX XX XXX"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>E-post *</label>
                                    <input
                                        type="email"
                                        required
                                        value={patientEmail}
                                        onChange={(e) => setPatientEmail(e.target.value)}
                                        placeholder="din@epost.no"
                                    />
                                </div>

                                <div className="turnstile-wrapper">
                                    <TurnstileWidget
                                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                                        onToken={setTurnstileToken}
                                    />
                                </div>

                                <div className="form-buttons">
                                    <button type="button" onClick={() => setStep('time')} className="btn btn-secondary">
                                        Tilbake
                                    </button>
                                    <button type="submit" disabled={!turnstileToken} className="btn btn-primary">
                                        Bekreft booking
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 'otp' && (
                        <div className="booking-step">
                            <h2>Bekreft med kode</h2>
                            <p className="step-description">
                                Vi har sendt en 6-sifret kode til <strong>{patientEmail}</strong>
                            </p>
                            <p className="otp-hint">Koden utløper om 10 minutter</p>

                            <form onSubmit={handleOtpSubmit} className="otp-form">
                                <div className="otp-input-wrapper">
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        pattern="\d{6}"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="otp-input"
                                        placeholder="000000"
                                        autoFocus
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary btn-full">
                                    Bekreft
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 'confirmed' && selectedSlot && selectedService && (
                        <div className="booking-step booking-confirmed">
                            <div className="success-icon-large">✓</div>
                            <h2>Booking bekreftet!</h2>

                            <div className="confirmation-details">
                                <div className="detail-row">
                                    <span className="detail-label">Behandling</span>
                                    <span className="detail-value">{selectedService.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Dato</span>
                                    <span className="detail-value">
                                        {new Date(selectedSlot.startTime).toLocaleDateString('no-NO', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Tid</span>
                                    <span className="detail-value">
                                        {new Date(selectedSlot.startTime).toLocaleTimeString('no-NO', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Klinikk</span>
                                    <span className="detail-value">{clinic.name}</span>
                                </div>
                            </div>

                            <p className="confirmation-note">
                                📧 Du har mottatt en bekreftelse på e-post med lenke for å endre eller avbestille.
                            </p>

                            <button onClick={() => window.location.href = '/'} className="btn btn-primary">
                                Ferdig
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
