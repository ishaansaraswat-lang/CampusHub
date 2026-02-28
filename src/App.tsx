import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Placements from "./pages/Placements";
import PlacementDetail from "./pages/PlacementDetail";
import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import SuperAdminEvents from "./pages/super-admin/EventsManagement";
import SuperAdminEventForm from "./pages/super-admin/EventForm";
import SuperAdminSubEvents from "./pages/super-admin/SubEventsManagement";
import SuperAdminCoordinators from "./pages/super-admin/CoordinatorsManagement";
import SuperAdminUsers from "./pages/super-admin/UsersManagement";
import SuperAdminSettings from "./pages/super-admin/Settings";
import PlacementAdminDashboard from "./pages/placement-admin/Dashboard";
import PlacementAdminCompanies from "./pages/placement-admin/CompaniesManagement";
import PlacementAdminJobs from "./pages/placement-admin/JobPostingsManagement";
import PlacementAdminApplications from "./pages/placement-admin/ApplicationsManagement";
import PlacementAdminResults from "./pages/placement-admin/ResultsManagement";
import EventAdminDashboard from "./pages/event-admin/Dashboard";
import EventAdminEvents from "./pages/event-admin/EventsManagement";
import EventAdminRegistrations from "./pages/event-admin/RegistrationsManagement";
import EventAdminResults from "./pages/event-admin/ResultsManagement";
import EventAdminGallery from "./pages/event-admin/GalleryManagement";
import EventAdminSubEvents from "./pages/event-admin/SubEventsManagement";
import MyEvents from "./pages/MyEvents";
import MyApplications from "./pages/MyApplications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/placements" element={<Placements />} />
            <Route path="/placements/:id" element={<PlacementDetail />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/my-events"
              element={
                <ProtectedRoute>
                  <MyEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute>
                  <MyApplications />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Routes */}
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/events"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/events/new"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminEventForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/events/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminEventForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/events/:id/sub-events"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminSubEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/events/:id/coordinators"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminCoordinators />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/users"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/settings"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminSettings />
                </ProtectedRoute>
              }
            />
            
            {/* Placement Admin Routes */}
            <Route
              path="/placement-admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['placement_cell', 'super_admin']}>
                  <PlacementAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement-admin/companies"
              element={
                <ProtectedRoute allowedRoles={['placement_cell', 'super_admin']}>
                  <PlacementAdminCompanies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement-admin/jobs"
              element={
                <ProtectedRoute allowedRoles={['placement_cell', 'super_admin']}>
                  <PlacementAdminJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement-admin/applications"
              element={
                <ProtectedRoute allowedRoles={['placement_cell', 'super_admin']}>
                  <PlacementAdminApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placement-admin/results"
              element={
                <ProtectedRoute allowedRoles={['placement_cell', 'super_admin']}>
                  <PlacementAdminResults />
                </ProtectedRoute>
              }
            />

            {/* Event Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['event_admin', 'super_admin']}>
                  <EventAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute allowedRoles={['event_admin', 'super_admin']}>
                  <EventAdminEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/registrations"
              element={
                <ProtectedRoute allowedRoles={['event_admin', 'super_admin']}>
                  <EventAdminRegistrations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/results"
              element={
                <ProtectedRoute allowedRoles={['event_admin', 'super_admin']}>
                  <EventAdminResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/gallery"
              element={
                <ProtectedRoute allowedRoles={['event_admin', 'super_admin']}>
                  <EventAdminGallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/:id/sub-events"
              element={
                <ProtectedRoute allowedRoles={['event_admin', 'super_admin']}>
                  <EventAdminSubEvents />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
