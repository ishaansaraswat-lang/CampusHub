import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface EventAttendanceQRProps {
  eventId: string;
  eventName: string;
}

const EventAttendanceQR: React.FC<EventAttendanceQRProps> = ({
  eventId,
  eventName,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const attendanceUrl = `${window.location.origin}/attendance/check-in?event=${eventId}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');

    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${eventName.replace(/\s+/g, '-').toLowerCase()}-attendance-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <QrCode className="h-5 w-5 text-primary" />
          </div>

          <div>
            <CardTitle>Attendance QR</CardTitle>
            <CardDescription>
              Students can scan this QR to mark their attendance.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center gap-5">
          <div
            ref={qrRef}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <QRCodeCanvas
              value={attendanceUrl}
              size={240}
              level="H"
              includeMargin
            />
          </div>

          <div className="text-center">
            <p className="font-medium">{eventName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Scan to open attendance check-in
            </p>
          </div>

          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download QR
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventAttendanceQR;