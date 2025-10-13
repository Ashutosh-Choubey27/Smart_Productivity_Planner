import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Mail, Crown, User, Calendar, MessageSquare, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { TeamGuide } from './TeamGuide';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited' | 'offline';
  joinedAt: Date;
  tasksAssigned: number;
  tasksCompleted: number;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  createdAt: Date;
  isActive: boolean;
}

export const TeamCollaboration: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: '1',
      name: 'Computer Science Project',
      description: 'Final semester group project collaboration',
      members: [
        {
          id: '1',
          name: 'You',
          email: 'you@example.com',
          role: 'owner',
          status: 'active',
          joinedAt: new Date('2024-01-15'),
          tasksAssigned: 12,
          tasksCompleted: 8
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          role: 'admin',
          status: 'active',
          joinedAt: new Date('2024-01-16'),
          tasksAssigned: 10,
          tasksCompleted: 7
        },
        {
          id: '3',
          name: 'Mike Chen',
          email: 'mike@example.com',
          role: 'member',
          status: 'offline',
          joinedAt: new Date('2024-01-17'),
          tasksAssigned: 8,
          tasksCompleted: 5
        }
      ],
      createdAt: new Date('2024-01-15'),
      isActive: true
    }
  ]);

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(workspaces[0]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const handleInviteMember = () => {
    if (!inviteEmail || !selectedWorkspace) return;

    // Simulate sending invitation
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setShowInviteDialog(false);
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-warning" />;
      case 'admin': return <User className="w-3 h-3 text-primary" />;
      case 'member': return <User className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'invited': return 'bg-warning';
      case 'offline': return 'bg-muted-foreground';
    }
  };

  const getProductivityScore = (member: TeamMember) => {
    if (member.tasksAssigned === 0) return 0;
    return Math.round((member.tasksCompleted / member.tasksAssigned) * 100);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="workspace" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="guide">How to Use</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
        </div>

        <TabsContent value="workspace">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
        {/* Workspace Overview */}
        {selectedWorkspace && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{selectedWorkspace.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedWorkspace.description}</p>
              </div>
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email Address</label>
                      <Input
                        type="email"
                        placeholder="colleague@university.edu"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Role</label>
                      <Select value={inviteRole} onValueChange={(value: 'member' | 'admin') => setInviteRole(value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleInviteMember} className="w-full">
                      Send Invitation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-semibold text-lg">{selectedWorkspace.members.length}</div>
                <div className="text-xs text-muted-foreground">Team Members</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-semibold text-lg">
                  {selectedWorkspace.members.reduce((sum, m) => sum + m.tasksCompleted, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Tasks Completed</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-semibold text-lg">
                  {Math.round(selectedWorkspace.members.reduce((sum, m) => sum + getProductivityScore(m), 0) / selectedWorkspace.members.length)}%
                </div>
                <div className="text-xs text-muted-foreground">Avg Productivity</div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members
              </h4>
              {selectedWorkspace.members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{member.name}</span>
                        {getRoleIcon(member.role)}
                      </div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{getProductivityScore(member)}%</div>
                    <div className="text-xs text-muted-foreground">
                      {member.tasksCompleted}/{member.tasksAssigned} tasks
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Meeting
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Team Chat
              </Button>
            </div>
          </div>
        )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <TeamGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};