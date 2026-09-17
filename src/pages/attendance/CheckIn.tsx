import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  QrCode,
} from 'lucide-react';

type CheckInState =
  | 'loading'
  | 'success'
  | 'already'
  | 'not_registered'
  | 'error';

export default function CheckIn() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');

  const [state, setState] = useState<CheckInState>('loading');
  const [eventName, setEventName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkIn = async () => {
      try {
        if (!eventId) {
          setState('error');
          setMessage('Invalid attendance QR code.');
          return;
        }

        // Get logged-in student
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setState('error');
          setMessage('Please log in before checking in.');
          return;
        }

        // Get event
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, name')
          .eq('id', eventId)
          .single();

        if (eventError || !event) {
          setState('error');
          setMessage('Event not found.');
          return;
        }

        setEventName(event.name);

        // Get all sub-events for this event
        const { data: subEvents, error: subEventsError } = await supabase
          .from('sub_events')
          .select('id')
          .eq('event_id', eventId);

        if (subEventsError) throw subEventsError;

        const subEventIds = (subEvents || []).map(
          (subEvent) => subEvent.id
        );

        if (subEventIds.length === 0) {
          setState('not_registered');
          setMessage('This event has no activities available for registration.');
          return;
        }

        // Check whether student registered for any activity
        const { data: registrations, error: registrationError } =
          await supabase
            .from('event_registrations')
            .select('id')
            .eq('user_id', user.id)
            .in('sub_event_id', subEventIds);

        if (registrationError) throw registrationError;

        if (!registrations || registrations.length === 0) {
          setState('not_registered');
          setMessage(
            'You are not registered for any activity in this event.'
          );
          return;
        }

        // Get student's profile ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profile) {
          setState('error');
          setMessage('Student profile could not be found.');
          return;
        }

        // Check existing attendance
        const { data: existingAttendance, error: existingError } =
          await supabase
            .from('event_attendance')
            .select('id, status')
            .eq('event_id', eventId)
            .eq('student_id', profile.id)
            .maybeSingle();

        if (existingError) throw existingError;

        if (existingAttendance) {
          setState('already');
          setMessage(
            existingAttendance.status === 'present'
              ? 'Your attendance has already been marked present.'
              : 'Attendance has already been recorded for this event.'
          );
          return;
        }

        // Mark attendance
        const { error: attendanceError } = await supabase
          .from('event_attendance')
          .insert({
            event_id: eventId,
            student_id: profile.id,
            status: 'present',
          });

        if (attendanceError) {
          // Handle duplicate attendance safely
          if (attendanceError.code === '23505') {
            setState('already');
            setMessage(
              'Your attendance has already been marked for this event.'
            );
            return;
          }

          throw attendanceError;
        }

        setState('success');
        setMessage('Your attendance has been successfully marked.');
      } catch (error) {
        console.error('Attendance check-in error:', error);
        setState('error');
        setMessage('Something went wrong while marking attendance.');
      }
    };

    checkIn();
  }, [eventId]);

  const renderContent = () => {
    if (state === 'loading') {
      return (
        <>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-5 text-xl font-semibold">
            Marking Attendance
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait...
          </p>
        </>
      );
    }

    if (state === 'success') {
      return (
        <>
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
          <h2 className="mt-5 text-2xl font-bold">
            Attendance Marked!
          </h2>
          <p className="mt-2 text-muted-foreground">
            {message}
          </p>
        </>
      );
    }

    if (state === 'already') {
      return (
        <>
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
          <h2 className="mt-5 text-2xl font-bold">
            Already Checked In
          </h2>
          <p className="mt-2 text-muted-foreground">
            {message}
          </p>
        </>
      );
    }

    if (state === 'not_registered') {
      return (
        <>
          <AlertCircle className="mx-auto h-16 w-16 text-amber-500" />
          <h2 className="mt-5 text-2xl font-bold">
            Registration Required
          </h2>
          <p className="mt-2 text-muted-foreground">
            {message}
          </p>
        </>
      );
    }

    return (
      <>
        <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
        <h2 className="mt-5 text-2xl font-bold">
          Check-in Failed
        </h2>
        <p className="mt-2 text-muted-foreground">
          {message}
        </p>
      </>
    );
  };

  return (
    <MainLayout>
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <QrCode className="h-6 w-6 text-primary" />
            </div>

            {eventName && (
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                {eventName}
              </p>
            )}

            {renderContent()}

            {state !== 'loading' && (
              <Button asChild className="mt-6">
                <Link to="/">Go to Dashboard</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}