import { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Plus,
  Trash2,
  Image,
  Upload,
  Images,
  Camera,
  Layers3,
} from 'lucide-react';
import {
  useMyAssignedEvents,
  useAssignedSubEvents,
  useAssignedGallery,
  useUploadGalleryImage,
  useDeleteGalleryImage,
} from '@/hooks/useEventAdmin';

export default function GalleryManagement() {
  const { data: events = [] } = useMyAssignedEvents();
  const [selectedEvent, setSelectedEvent] = useState<string>('');

  const { data: subEvents = [] } =
    useAssignedSubEvents(selectedEvent || null);

  const { data: gallery = [], isLoading } =
    useAssignedGallery(selectedEvent || null);

  const uploadImage = useUploadGalleryImage();
  const deleteImage = useDeleteGalleryImage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadSubEvent, setUploadSubEvent] = useState<string>('none');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedEventName =
    events.find((e) => e.id === selectedEvent)?.name || '';

  const linkedImages = gallery.filter(
    (item) => item.sub_event_id
  ).length;

  const handleUpload = () => {
    if (!selectedFile || !selectedEvent) return;

    uploadImage.mutate(
      {
        file: selectedFile,
        eventId: selectedEvent,
        subEventId:
          uploadSubEvent !== 'none'
            ? uploadSubEvent
            : undefined,
        caption,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedFile(null);
          setCaption('');
          setUploadSubEvent('none');

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      }
    );
  };

  const closeDialog = () => {
    if (uploadImage.isPending) return;

    setDialogOpen(false);
    setSelectedFile(null);
    setCaption('');
    setUploadSubEvent('none');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-900/10 sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-indigo-300/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50 backdrop-blur-sm">
                <Camera className="h-3.5 w-3.5" />
                Event Media
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Gallery Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">
                Upload, organise, and manage photos from your assigned
                events and activities.
              </p>

              {selectedEvent && (
                <p className="mt-3 text-sm font-medium text-white/90">
                  {selectedEventName}
                </p>
              )}
            </div>

            {selectedEvent && (
              <Dialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="h-11 rounded-xl bg-white px-5 font-semibold text-blue-700 shadow-sm hover:bg-blue-50">
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </DialogTrigger>

                <DialogContent className="rounded-2xl sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Image</DialogTitle>
                    <DialogDescription>
                      Add a photo to the selected event gallery.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    {/* File */}
                    <div className="space-y-2">
                      <Label>Image *</Label>

                      <div
                        className="cursor-pointer rounded-xl border-2 border-dashed border-border/70 bg-muted/20 p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                      >
                        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Upload className="h-5 w-5" />
                        </div>

                        <p className="text-sm font-medium">
                          {selectedFile
                            ? selectedFile.name
                            : 'Choose an image'}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Click to browse image files
                        </p>

                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            setSelectedFile(
                              e.target.files?.[0] || null
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Sub-event */}
                    <div className="space-y-2">
                      <Label>Activity / Sub-Event</Label>

                      <Select
                        value={uploadSubEvent}
                        onValueChange={setUploadSubEvent}
                      >
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="none">
                            General Event Gallery
                          </SelectItem>

                          {subEvents.map((se) => (
                            <SelectItem
                              key={se.id}
                              value={se.id}
                            >
                              {se.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Caption */}
                    <div className="space-y-2">
                      <Label>Caption</Label>

                      <Input
                        className="h-11 rounded-xl"
                        value={caption}
                        onChange={(e) =>
                          setCaption(e.target.value)
                        }
                        placeholder="Optional caption..."
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="rounded-lg"
                      onClick={closeDialog}
                      disabled={uploadImage.isPending}
                    >
                      Cancel
                    </Button>

                    <Button
                      className="rounded-lg"
                      onClick={handleUpload}
                      disabled={
                        !selectedFile ||
                        uploadImage.isPending
                      }
                    >
                      {uploadImage.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </section>

        {/* Event selector */}
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4">
              <h2 className="font-semibold">Select Event</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose an event to view and manage its photo gallery.
              </p>
            </div>

            <Select
              value={selectedEvent}
              onValueChange={setSelectedEvent}
            >
              <SelectTrigger className="h-11 w-full rounded-xl sm:w-[320px]">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>

              <SelectContent>
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Stats */}
        {selectedEvent && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={Images}
              label="Total Photos"
              value={gallery.length}
            />

            <StatCard
              icon={Layers3}
              label="Activity Photos"
              value={linkedImages}
              tone="blue"
            />

            <StatCard
              icon={Camera}
              label="Activities"
              value={subEvents.length}
              tone="indigo"
            />
          </div>
        )}

        {/* Gallery */}
        {!selectedEvent ? (
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Image className="h-7 w-7" />
              </div>

              <h3 className="font-semibold">
                Select an event
              </h3>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Select an event above to view and manage its gallery.
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : gallery.length === 0 ? (
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Images className="h-7 w-7" />
              </div>

              <h3 className="font-semibold">
                No photos yet
              </h3>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Upload photos to start building the event gallery.
              </p>

              <Button
                className="mt-5 rounded-lg"
                onClick={() => setDialogOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload First Photo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="font-semibold">
                    Event Gallery
                  </h2>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {gallery.length} photo
                    {gallery.length === 1 ? '' : 's'} in this gallery
                  </p>
                </div>

                <div className="hidden items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs font-medium text-muted-foreground sm:flex">
                  <Image className="h-3.5 w-3.5" />
                  Media Library
                </div>
              </div>

              <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 md:grid-cols-3 lg:grid-cols-4">
                {gallery.map((item) => (
                  <Card
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border-border/60 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={item.image_url}
                        alt={
                          item.caption || 'Gallery image'
                        }
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-3 top-3 h-9 w-9 rounded-xl opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100"
                        onClick={() =>
                          deleteImage.mutate({
                            id: item.id,
                            imageUrl: item.image_url,
                          })
                        }
                        disabled={deleteImage.isPending}
                      >
                        {deleteImage.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {item.caption && (
                      <CardContent className="p-4">
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                          {item.caption}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'slate',
}: {
  icon: any;
  label: string;
  value: number;
  tone?: 'slate' | 'blue' | 'indigo';
}) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-50 text-blue-700',
    indigo: 'bg-indigo-50 text-indigo-700',
  };

  return (
    <Card className="rounded-2xl border-border/70 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-2xl font-bold tracking-tight">
            {value}
          </p>

          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
