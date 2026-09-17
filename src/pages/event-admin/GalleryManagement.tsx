import { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Image, Upload } from 'lucide-react';
import { useMyAssignedEvents, useAssignedSubEvents, useAssignedGallery, useUploadGalleryImage, useDeleteGalleryImage } from '@/hooks/useEventAdmin';

export default function GalleryManagement() {
  const { data: events = [] } = useMyAssignedEvents();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const { data: subEvents = [] } = useAssignedSubEvents(selectedEvent || null);
  const { data: gallery = [], isLoading } = useAssignedGallery(selectedEvent || null);
  const uploadImage = useUploadGalleryImage();
  const deleteImage = useDeleteGalleryImage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadSubEvent, setUploadSubEvent] = useState<string>('none');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (!selectedFile || !selectedEvent) return;
    uploadImage.mutate({
      file: selectedFile,
      eventId: selectedEvent,
      subEventId: uploadSubEvent !== 'none' ? uploadSubEvent : undefined,
      caption,
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setSelectedFile(null);
        setCaption('');
        setUploadSubEvent('none');
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gallery</h1>
            <p className="text-muted-foreground">Manage event photos</p>
          </div>
          {selectedEvent && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Upload Image</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Image</DialogTitle>
                  <DialogDescription>Add a photo to the event gallery.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Image *</Label>
                    <Input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sub-Event (optional)</Label>
                    <Select value={uploadSubEvent} onValueChange={setUploadSubEvent}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {subEvents.map((se) => <SelectItem key={se.id} value={se.id}>{se.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Caption</Label>
                    <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpload} disabled={!selectedFile || uploadImage.isPending}>
                    {uploadImage.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Upload className="mr-2 h-4 w-4" />Upload
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select Event" /></SelectTrigger>
            <SelectContent>
              {events.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {!selectedEvent ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Image className="mx-auto mb-2 h-8 w-8" />
              Select an event to manage its gallery
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : gallery.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Image className="mx-auto mb-2 h-8 w-8" />
              No images yet. Upload some photos above.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {gallery.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img src={item.image_url} alt={item.caption || 'Gallery image'} className="h-full w-full object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => deleteImage.mutate({ id: item.id, imageUrl: item.image_url })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {item.caption && (
                  <CardContent className="p-3">
                    <p className="text-sm text-muted-foreground">{item.caption}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
