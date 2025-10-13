import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Users, UserPlus, MessageSquare, Calendar, 
  TrendingUp, Info, Crown, Shield, Sparkles 
} from 'lucide-react';

export const TeamGuide: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="h-6 w-6 text-primary" />
            Team Collaboration Tab - Complete Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* What is Team Tab */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              What is the Team Tab?
            </h3>
            
            <Alert className="border-primary/50 bg-primary/5">
              <Users className="h-4 w-4 text-primary" />
              <AlertDescription>
                The <strong>Team Collaboration</strong> tab is designed for students working on <strong>group projects</strong>, 
                study groups, or any collaborative academic work. It allows you to create workspaces, invite team members, 
                assign tasks, and track everyone's productivity in one place.
              </AlertDescription>
            </Alert>
          </div>

          {/* How to Use */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-warning" />
              How to Use Team Collaboration
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-3 p-4 bg-muted/30 rounded-lg border">
                <Badge className="h-6 shrink-0">1</Badge>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    Create a Workspace
                    <Crown className="h-4 w-4 text-warning" />
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Click <strong>"Create Workspace"</strong> and name it after your project 
                    (e.g., "Computer Science Final Project", "Marketing Case Study Group").
                    You automatically become the workspace <strong>Owner</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-muted/30 rounded-lg border">
                <Badge className="h-6 shrink-0">2</Badge>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    Invite Team Members
                    <UserPlus className="h-4 w-4 text-primary" />
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Click <strong>"Invite Member"</strong> button, enter your teammate's email address, 
                    and assign them a role:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-muted-foreground ml-4">
                    <li><strong>Owner:</strong> Full control (you)</li>
                    <li><strong>Admin:</strong> Can invite others, manage tasks</li>
                    <li><strong>Member:</strong> Can view and complete assigned tasks</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-muted/30 rounded-lg border">
                <Badge className="h-6 shrink-0">3</Badge>
                <div>
                  <h4 className="font-semibold mb-1">Track Team Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    The workspace dashboard shows:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-muted-foreground ml-4">
                    <li><strong>Total team members</strong> in the workspace</li>
                    <li><strong>Tasks completed</strong> by everyone combined</li>
                    <li><strong>Average productivity</strong> percentage across the team</li>
                    <li><strong>Individual member stats</strong> - tasks assigned vs. completed</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-muted/30 rounded-lg border">
                <Badge className="h-6 shrink-0">4</Badge>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    Collaborate & Communicate
                    <MessageSquare className="h-4 w-4 text-success" />
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use the quick action buttons for:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-muted-foreground ml-4">
                    <li><strong>Schedule Meeting:</strong> Plan group study sessions or project discussions</li>
                    <li><strong>Team Chat:</strong> Internal communication for task coordination</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Life Use Cases */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Perfect For These Scenarios
            </h3>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-success" />
                  Group Course Projects
                </h4>
                <p className="text-xs text-muted-foreground">
                  Final semester projects, lab assignments, research papers - assign roles, 
                  track who's doing what, and monitor overall progress.
                </p>
              </div>

              <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-success" />
                  Study Groups
                </h4>
                <p className="text-xs text-muted-foreground">
                  Create a workspace for exam preparation groups. Share study materials, 
                  assign topics to review, and coordinate study sessions.
                </p>
              </div>

              <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  Competition Teams
                </h4>
                <p className="text-xs text-muted-foreground">
                  Hackathons, coding competitions, case study contests - manage team tasks, 
                  deadlines, and member contributions.
                </p>
              </div>

              <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-success" />
                  Club Activities
                </h4>
                <p className="text-xs text-muted-foreground">
                  Student club projects, event planning committees - organize responsibilities 
                  and keep everyone accountable.
                </p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <Alert className="border-warning/50 bg-warning/5">
            <Info className="h-4 w-4 text-warning" />
            <AlertDescription>
              <strong>📌 Current Status - Demo Mode:</strong>
              <p className="mt-2 text-sm">
                The Team tab currently shows <strong>sample/demo data</strong> with a mock workspace called 
                "Computer Science Project" and 3 example team members. This is to demonstrate how the feature works.
              </p>
              <p className="mt-2 text-sm font-medium">
                🚀 <strong>To make it fully functional:</strong> You would need to integrate it with a backend database 
                (like Supabase) to enable real user invitations, task assignments, and live collaboration.
              </p>
            </AlertDescription>
          </Alert>

          {/* Key Features */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Key Features Available
            </h3>
            
            <div className="grid md:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg border">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h4 className="font-medium text-sm">Team Overview</h4>
                <p className="text-xs text-muted-foreground mt-1">See all members & roles</p>
              </div>

              <div className="text-center p-3 bg-muted/30 rounded-lg border">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-success" />
                <h4 className="font-medium text-sm">Productivity Tracking</h4>
                <p className="text-xs text-muted-foreground mt-1">Monitor completion rates</p>
              </div>

              <div className="text-center p-3 bg-muted/30 rounded-lg border">
                <UserPlus className="h-6 w-6 mx-auto mb-2 text-warning" />
                <h4 className="font-medium text-sm">Easy Invitations</h4>
                <p className="text-xs text-muted-foreground mt-1">Email-based member invites</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};