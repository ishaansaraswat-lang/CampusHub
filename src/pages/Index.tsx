import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  GraduationCap,
  Calendar,
  Briefcase,
  Users,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Event Management',
    description:
      'Discover and register for cultural fests, sports events, and more.',
    points: [
      'Browse all campus events',
      'Easy registration process',
      'Track participations',
    ],
  },
  {
    icon: Briefcase,
    title: 'Placement Portal',
    description:
      'Access job postings and manage your placement applications.',
    points: [
      'View company profiles',
      'Apply to opportunities',
      'Track application status',
    ],
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description:
      'Tailored experience for students, admins, and placement cells.',
    points: [
      'Student dashboard',
      'Event admin controls',
      'Super admin oversight',
    ],
  },
];

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-background shadow-extruded-sm transition-transform duration-300 hover:scale-105">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>

            <span className="font-display text-2xl font-bold tracking-tight">
              College Hub
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>

            <Button className="shadow-lg transition-all hover:scale-105" asChild>
              <Link to="/auth?tab=signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4">
        <section className="flex min-h-[80vh] flex-col items-center justify-center text-center">
          {/* <div className="mb-6 rounded-full border bg-background/60 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
            ✨ Modern Campus Management Platform
          </div> */}

          <h1 className="max-w-5xl font-display text-5xl font-extrabold tracking-tight md:text-7xl">
            Your Campus,
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {' '}
              One Platform
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Manage college events, placements, and student communities —
            beautifully organized in one place.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group shadow-lg transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link to="/auth?tab=signup">
                Join Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link to="/events">Browse Events</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="mb-14 text-center">
            <h2 className="font-display text-4xl font-bold">
              Everything You Need
            </h2>

            <p className="mt-4 text-muted-foreground">
              Powerful tools designed for modern campus life
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={index}
                  className="group border bg-background/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl"
                >
                  <CardHeader>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>

                    <CardTitle className="text-2xl">
                      {feature.title}
                    </CardTitle>

                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {feature.points.map((point) => (
                        <li key={point} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/50 py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 College Hub. Built for campus communities.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;