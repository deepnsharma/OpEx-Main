import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, Edit, Save, X, Calendar, MapPin, Target, DollarSign } from 'lucide-react';
import { useProgressPercentage, useCurrentPendingStage } from '@/hooks/useWorkflowTransactions';

interface Initiative {
  id: string | number;
  title: string;
  initiativeNumber?: string;
  site: string;
  status: string;
  priority: string;
  expectedSavings: string | number;
  actualSavings?: string | number;
  progressPercentage?: number;
  progress: number;
  lastUpdated: string;
  updatedAt?: string;
  discipline: string;
  submittedDate: string;
  createdAt?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  currentStage?: number;
  requiresMoc?: boolean;
  requiresCapex?: boolean;
  createdByName?: string;
  createdByEmail?: string;
}

interface InitiativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initiative: Initiative | null;
  mode: 'view' | 'edit';
  onSave?: (data: any) => void;
}

// Mock workflow stage names for display
const WORKFLOW_STAGE_NAMES: { [key: number]: string } = {
  1: 'Register Initiative',
  2: 'Site Lead Review',
  3: 'Initiative Lead Assignment',
  4: 'Site Head Review',
  5: 'Corp TSO Review',
  6: 'MoC Review',
  7: 'CAPEX Review',
  8: 'Final Approval',
  9: 'Implementation',
  10: 'Closure'
};

export default function InitiativeModal({ isOpen, onClose, initiative, mode, onSave }: InitiativeModalProps) {
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [formData, setFormData] = useState<any>(initiative || {});

  // Get real progress and current stage data
  const { data: progressData } = useProgressPercentage(Number(initiative?.id));
  const { data: currentStageData } = useCurrentPendingStage(Number(initiative?.id));

  const actualProgress = progressData?.progressPercentage ?? initiative?.progress ?? 0;
  const currentStageName = currentStageData?.stageName || 
    WORKFLOW_STAGE_NAMES[initiative?.currentStage || 1] || 
    'Register Initiative';

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(initiative || {});
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "bg-success text-success-foreground";
      case "in progress": return "bg-primary text-primary-foreground";
      case "under review": return "bg-warning text-warning-foreground";
      case "pending decision": return "bg-warning text-warning-foreground";
      case "registered": return "bg-muted text-muted-foreground";
      case "implementation": return "bg-primary text-primary-foreground";
      case "moc review": return "bg-warning text-warning-foreground";
      case "cmo review": return "bg-primary text-primary-foreground";
      case "decision pending": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-destructive text-destructive-foreground";
      case "Medium": return "bg-warning text-warning-foreground";
      case "Low": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (!initiative) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEditing ? <Edit className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              <span>
                {isEditing ? 'Edit Initiative' : 'View Initiative'} - {initiative.initiativeNumber || initiative.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && mode !== 'edit' && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {isEditing && (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Progress Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Status & Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(initiative.status)}>
                      {initiative.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge className={getPriorityColor(initiative.priority)}>
                      {initiative.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{actualProgress}%</span>
                  </div>
                  <Progress value={actualProgress} className="h-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Stage</p>
                  <p className="font-medium">{currentStageName}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Expected Savings</p>
                  <p className="text-lg font-semibold text-success">
                    {typeof initiative.expectedSavings === 'number' 
                      ? `₹${initiative.expectedSavings.toLocaleString()}` 
                      : initiative.expectedSavings}
                  </p>
                </div>
                {initiative.actualSavings && (
                  <div>
                    <p className="text-sm text-muted-foreground">Actual Savings</p>
                    <p className="text-lg font-semibold text-success">
                      {typeof initiative.actualSavings === 'number' 
                        ? `₹${initiative.actualSavings.toLocaleString()}` 
                        : initiative.actualSavings}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Initiative Number</Label>
                  <Input
                    value={formData.initiativeNumber || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, initiativeNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Site</Label>
                  {isEditing ? (
                    <Select value={formData.site} onValueChange={(value) => setFormData({ ...formData, site: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NDS">NDS</SelectItem>
                        <SelectItem value="HSD1">HSD1</SelectItem>
                        <SelectItem value="HSD2">HSD2</SelectItem>
                        <SelectItem value="HSD3">HSD3</SelectItem>
                        <SelectItem value="DHJ">DHJ</SelectItem>
                        <SelectItem value="APL">APL</SelectItem>
                        <SelectItem value="TCD">TCD</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={formData.site || ''} disabled />
                  )}
                </div>
                <div>
                  <Label>Discipline</Label>
                  {isEditing ? (
                    <Select value={formData.discipline} onValueChange={(value) => setFormData({ ...formData, discipline: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OP">Operations</SelectItem>
                        <SelectItem value="MT">Maintenance</SelectItem>
                        <SelectItem value="EG">Engineering</SelectItem>
                        <SelectItem value="QA">Quality Assurance</SelectItem>
                        <SelectItem value="SF">Safety</SelectItem>
                        <SelectItem value="ENV">Environment</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={formData.discipline || ''} disabled />
                  )}
                </div>
                <div>
                  <Label>Priority</Label>
                  {isEditing ? (
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={formData.priority || ''} disabled />
                  )}
                </div>
                <div>
                  <Label>Expected Savings (₹)</Label>
                  <Input
                    value={formData.expectedSavings || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, expectedSavings: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">{initiative.createdByName || 'N/A'}</p>
                  {initiative.createdByEmail && (
                    <p className="text-sm text-muted-foreground">{initiative.createdByEmail}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted Date</p>
                  <p className="font-medium">{initiative.submittedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{initiative.lastUpdated}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Stage</p>
                  <p className="font-medium">Stage {initiative.currentStage || 1}: {currentStageName}</p>
                </div>
              </div>

              {(initiative.requiresMoc || initiative.requiresCapex) && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Requirements</p>
                  <div className="flex gap-4">
                    {initiative.requiresMoc && (
                      <Badge variant="outline">MoC Required</Badge>
                    )}
                    {initiative.requiresCapex && (
                      <Badge variant="outline">CAPEX Required</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}