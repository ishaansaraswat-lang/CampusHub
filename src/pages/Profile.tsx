import { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  useUpdateProfile,
  useUploadAvatar,
  useMyEventRegistrations,
  useMyPlacementApplications,
} from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Camera,
  Loader2,
  User,
  Calendar,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  Building,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const DEPARTMENTS = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Chemical',
  'Information Technology',
];

const YEARS = [1, 2, 3, 4];

export default function Profile() {
  const { profile, roles } = useAuth();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const { data: eventRegistrations, isLoading: loadingEvents } = useMyEventRegistrations();
  const { data: placementApplications, isLoading: loadingPlacements } = useMyPlacementApplications();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    student_id: profile?.student_id || '',
    department: profile?.department || '',
    year: profile?.year?.toString() || '',
    phone: profile?.phone || '',
    cgpa: profile?.cgpa?.toString() || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      name: formData.name,
      student_id: formData.student_id || null,
      department: formData.department || null,
      year: formData.year ? parseInt(formData.year) : null,
      phone: formData.phone || null,
      cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar.mutate(file);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'selected':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
      case 'rejected':
      case 'withdrawn':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'waitlisted':
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile and view your participation history
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="mr-2 h-4 w-4" />
              My Events
            </TabsTrigger>
            <TabsTrigger value="placements">
              <Briefcase className="mr-2 h-4 w-4" />
              My Applications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Avatar Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                  <CardDescription>
                    Click to upload a new photo
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32 cursor-pointer" onClick={handleAvatarClick}>
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-3xl">
                        {profile?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full"
                      onClick={handleAvatarClick}
                      disabled={uploadAvatar.isPending}
                    >
                      {uploadAvatar.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="text-center">
                    <p className="font-medium">{profile?.name}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1">
                    {roles.map((role) => (
                      <Badge key={role} variant="outline">
                        {role.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Profile Form */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="email"
                            value={profile?.email || ''}
                            className="pl-10"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="student_id">Student ID</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="student_id"
                            value={formData.student_id}
                            onChange={(e) => handleInputChange('student_id', e.target.value)}
                            className="pl-10"
                            placeholder="e.g., 2021BCS001"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="pl-10"
                            placeholder="+91 9876543210"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => handleInputChange('department', value)}
                        >
                          <SelectTrigger>
                            <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEPARTMENTS.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Select
                          value={formData.year}
                          onValueChange={(value) => handleInputChange('year', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {YEARS.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                Year {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cgpa">CGPA</Label>
                        <Input
                          id="cgpa"
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={formData.cgpa}
                          onChange={(e) => handleInputChange('cgpa', e.target.value)}
                          placeholder="e.g., 8.5"
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={updateProfile.isPending}>
                      {updateProfile.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Event Registrations</CardTitle>
                  <CardDescription>Events and activities you've registered for</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/my-events">View All →</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loadingEvents ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : eventRegistrations?.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      You haven't registered for any events yet
                    </p>
                    <Button asChild className="mt-4">
                      <Link to="/events">Browse Events</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventRegistrations?.map((registration: any) => (
                      <div
                        key={registration.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          {registration.sub_events?.events?.banner_url && (
                            <img
                              src={registration.sub_events.events.banner_url}
                              alt=""
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{registration.sub_events?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {registration.sub_events?.events?.name}
                            </p>
                            {registration.sub_events?.schedule && (
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(registration.sub_events.schedule), 'PPp')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(registration.status)}>
                            {registration.status}
                          </Badge>
                          {registration.team_name && (
                            <Badge variant="outline">Team: {registration.team_name}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placements Tab */}
          <TabsContent value="placements" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Job Applications</CardTitle>
                  <CardDescription>Track your placement applications</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/my-applications">View All →</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loadingPlacements ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : placementApplications?.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      You haven't applied for any jobs yet
                    </p>
                    <Button asChild className="mt-4">
                      <Link to="/placements">Browse Jobs</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {placementApplications?.map((application: any) => (
                      <div
                        key={application.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          {application.job_postings?.companies?.logo_url && (
                            <img
                              src={application.job_postings.companies.logo_url}
                              alt=""
                              className="h-12 w-12 rounded-md object-contain"
                            />
                          )}
                          <div>
                            <p className="font-medium">{application.job_postings?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {application.job_postings?.companies?.name}
                            </p>
                            {application.job_postings?.package_lpa && (
                              <p className="text-sm font-medium text-primary">
                                ₹{application.job_postings.package_lpa} LPA
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Applied {format(new Date(application.created_at), 'PP')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
