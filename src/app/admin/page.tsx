
'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } 'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/ui/loading-screen';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Mock data - replace with your actual data fetching logic
const mockUsers = [
  {
    uid: '1a2b3c4d5e',
    email: 'elon.musk@example.com',
    displayName: 'Elon Musk',
    photoURL: 'https://placehold.co/40x40/E81123/FFFFFF?text=E',
    creationTime: '2024-01-15T10:30:00Z',
  },
  {
    uid: '6f7g8h9i0j',
    email: 'ada.lovelace@example.com',
    displayName: 'Ada Lovelace',
    photoURL: 'https://placehold.co/40x40/4A90E2/FFFFFF?text=A',
    creationTime: '2024-02-20T14:00:00Z',
  },
  {
    uid: 'k1l2m3n4o5',
    email: 'marie.curie@example.com',
    displayName: 'Marie Curie',
    photoURL: 'https://placehold.co/40x40/50E3C2/FFFFFF?text=M',
    creationTime: '2024-03-10T09:45:00Z',
  },
  {
    uid: 'p6q7r8s9t0',
    email: 'nikola.tesla@example.com',
    displayName: 'Nikola Tesla',
    photoURL: 'https://placehold.co/40x40/F5A623/FFFFFF?text=N',
    creationTime: '2024-04-05T18:20:00Z',
  },
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  React.useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/chat');
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Button asChild size="icon" variant="outline" className="sm:hidden">
            <Link href="/chat">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Chat</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Avatar</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Creation Date
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((registeredUser) => (
                    <TableRow key={registeredUser.uid}>
                      <TableCell className="hidden sm:table-cell">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={registeredUser.photoURL} alt={registeredUser.displayName} />
                          <AvatarFallback>
                            {registeredUser.displayName?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{registeredUser.displayName}</TableCell>
                      <TableCell>{registeredUser.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(registeredUser.creationTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                         <Button size="sm" variant="outline">
                           View Details
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
       <footer className="flex-shrink-0 px-4 py-4 text-center text-xs text-muted-foreground">
          <Button asChild variant="link">
            <Link href="/chat">
               Back to Chat
            </Link>
          </Button>
        </footer>
    </div>
  );
}
