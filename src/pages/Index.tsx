import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Calendar, Briefcase, Users, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">College Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?tab=signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <section className="py-12 text-center md:py-24">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Your Campus, <span className="text-primary">One Platform</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Manage college events, track placements, and stay connected with campus activities. 
            From Sabrang to Sparda, everything in one place.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/auth?tab=signup">
                Join Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="py-12">
          <h2 className="mb-8 text-center text-3xl font-bold">Everything You Need</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Calendar className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Event Management</CardTitle>
                <CardDescription>
                  Discover and register for cultural fests, sports events, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Browse all campus events</li>
                  <li>• Easy registration process</li>
                  <li>• Track your participations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Briefcase className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Placement Portal</CardTitle>
                <CardDescription>
                  Access job postings and manage your placement applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• View company profiles</li>
                  <li>• Apply to opportunities</li>
                  <li>• Track application status</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Tailored experience for students, admins, and placement cells
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Student dashboard</li>
                  <li>• Event admin controls</li>
                  <li>• Super admin oversight</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 College Hub. Built for campus communities.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
