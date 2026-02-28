import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAdminEvent, useCreateEvent, useUpdateEvent } from '@/hooks/useAdminEvents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type EventStatus = Database['public']['Enums']['event_status'];

export default function EventForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const { data: existingEvent, isLoading: eventLoading } = useAdminEvent(isEditing ? id : '');
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    banner_url: '',
    start_date: '',
    end_date: '',
    status: 'draft' as EventStatus,
  });

  useEffect(() => {
    if (existingEvent) {
      setFormData({
        name: existingEvent.name || '',
        slug: existingEvent.slug || '',
        description: existingEvent.description || '',
        banner_url: existingEvent.banner_url || '',
        start_date: existingEvent.start_date || '',
        end_date: existingEvent.end_date || '',
        status: existingEvent.status,
      });
    }
  }, [existingEvent]);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      await updateEvent.mutateAsync({ id, ...formData });
    } else {
      await createEvent.mutateAsync(formData);
    }

    navigate('/super-admin/events');
  };

  const isPending = createEvent.isPending || updateEvent.isPending;

  if (isEditing && eventLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link to="/super-admin/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Event' : 'Create New Event'}</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Update the event details below'
                : 'Fill in the details to create a new event like Sabrang, Sparda, etc.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Sabrang 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/events/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="sabrang-2024"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the event..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_url">Banner Image URL</Label>
                <Input
                  id="banner_url"
                  type="url"
                  value={formData.banner_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, banner_url: e.target.value }))}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: EventStatus) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link to="/super-admin/events">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? 'Update Event' : 'Create Event'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
