import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, FileText, TrendingUp, Target, RefreshCw, BarChart3, PieChart, Lock, Filter, Calendar, CheckCircle, AlertTriangle, DollarSign, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { workflowTransactionAPI, monthlyMonitoringAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  site: string;
}

interface Initiative {
  id: number;
  initiativeNumber: string;
  title: string;
  status: string;
  site: string;
  initiativeLead: string;
  expectedSavings: number;
  description?: string;
  currentStage?: number;
}

interface MonthlyMonitoringEntry {
  id?: number;
  monitoringMonth: string; // YYYY-MM format
  kpiDescription: string;
  targetValue: number;
  achievedValue?: number;
  deviation?: number;
  deviationPercentage?: number;
  remarks?: string;
  isFinalized: boolean;
  faApproval: boolean;
  faComments?: string;
  enteredBy: string;
  entryDate?: string;
  lastModified?: string;
  category?: string;
}

interface MonthlyMonitoringProps {
  user: User;
}

export default function MonthlyMonitoring({ user }: MonthlyMonitoringProps) {
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MonthlyMonitoringEntry | null>(null);
  const [formData, setFormData] = useState<Partial<MonthlyMonitoringEntry>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const itemsPerPage = 6;

  // Fetch initiatives that are approved for Stage 9 (Savings Monitoring)
  const { data: approvedInitiatives = [], isLoading: initiativesLoading } = useQuery({
    queryKey: ['stage9-approved-initiatives', user.site, user.email],
    queryFn: async () => {
      try {
        // Get initiatives where stage 9 is approved and user is assigned as STLD
        const response = await workflowTransactionAPI.getPendingBySiteAndRole(user.site, 'STLD');
        
        // Filter to only show initiatives where stage 9 (Savings Monitoring) is approved
        // and the current user is the assigned Site Lead
        const filteredInitiatives = response.filter((transaction: any) => 
          transaction.stageNumber === 9 && 
          transaction.status === 'APPROVED' &&
          transaction.assignedUserEmail === user.email
        );
        
        return filteredInitiatives.map((transaction: any) => ({
          id: transaction.initiativeId,
          initiativeNumber: transaction.initiativeNumber,
          title: transaction.initiativeTitle,
          status: transaction.initiativeStatus,
          site: transaction.site,
          initiativeLead: transaction.assignedUserEmail,
          expectedSavings: transaction.expectedSavings || 0,
          description: transaction.description,
          currentStage: transaction.stageNumber
        }));
      } catch (error) {
        console.error('Error fetching approved initiatives:', error);
        return [];
      }
    },
  });

  // Filter and search initiatives
  const filteredInitiatives = approvedInitiatives.filter((initiative: Initiative) => {
    const matchesSearch = initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         initiative.initiativeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || initiative.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic for initiatives
  const paginatedInitiatives = filteredInitiatives.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredInitiatives.length / itemsPerPage);

  // Fetch monitoring entries for selected initiative
  const { data: monitoringEntries = [], isLoading: entriesLoading, refetch: refetchEntries } = useQuery({
    queryKey: ['monitoring-entries', selectedInitiativeId],
    queryFn: async () => {
      if (!selectedInitiativeId) return [];
      const result = await monthlyMonitoringAPI.getMonitoringEntries(selectedInitiativeId);
      return result.data || [];
    },
    enabled: !!selectedInitiativeId,
  });

  // Fetch entries for specific month
  const { data: monthlyEntries = [], isLoading: monthlyLoading } = useQuery({
    queryKey: ['monitoring-entries', selectedInitiativeId, selectedMonth],
    queryFn: async () => {
      if (!selectedInitiativeId || !selectedMonth) return [];
      const result = await monthlyMonitoringAPI.getMonitoringEntriesByMonth(selectedInitiativeId, selectedMonth);
      return result.data || [];
    },
    enabled: !!selectedInitiativeId && !!selectedMonth,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (entry: MonthlyMonitoringEntry) => {
      const entryWithDeviation = {
        ...entry,
        deviation: entry.achievedValue && entry.targetValue 
          ? entry.achievedValue - entry.targetValue 
          : undefined,
        deviationPercentage: entry.achievedValue && entry.targetValue 
          ? ((entry.achievedValue - entry.targetValue) / entry.targetValue) * 100 
          : undefined,
        enteredBy: user.email,
        entryDate: new Date().toISOString(),
        initiativeId: selectedInitiativeId
      };
      
      const result = await monthlyMonitoringAPI.createMonitoringEntry(selectedInitiativeId!, entryWithDeviation);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-entries'] });
      toast({ title: "Success", description: "Monitoring entry created successfully" });
      setIsDialogOpen(false);
      setFormData({});
      refetchEntries();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create monitoring entry", 
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, entry }: { id: number; entry: MonthlyMonitoringEntry }) => {
      const entryWithDeviation = {
        ...entry,
        deviation: entry.achievedValue && entry.targetValue 
          ? entry.achievedValue - entry.targetValue 
          : undefined,
        deviationPercentage: entry.achievedValue && entry.targetValue 
          ? ((entry.achievedValue - entry.targetValue) / entry.targetValue) * 100 
          : undefined,
        lastModified: new Date().toISOString()
      };
      
      const result = await monthlyMonitoringAPI.updateMonitoringEntry(id, entryWithDeviation);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-entries'] });
      toast({ title: "Success", description: "Monitoring entry updated successfully" });
      setIsDialogOpen(false);
      setEditingEntry(null);
      setFormData({});
      refetchEntries();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update monitoring entry", 
        variant: "destructive" 
      });
    }
  });

  const finalizeMutation = useMutation({
    mutationFn: async ({ id, isFinalized }: { id: number; isFinalized: boolean }) => {
      const result = await monthlyMonitoringAPI.updateFinalizationStatus(id, isFinalized);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-entries'] });
      toast({ title: "Success", description: "Finalization status updated" });
      refetchEntries();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update finalization status", 
        variant: "destructive" 
      });
    }
  });

  const faApprovalMutation = useMutation({
    mutationFn: async ({ id, faApproval, faComments }: { id: number; faApproval: boolean; faComments?: string }) => {
      const result = await monthlyMonitoringAPI.updateFAApproval(id, faApproval, faComments);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-entries'] });
      toast({ title: "Success", description: "F&A approval status updated" });
      refetchEntries();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update F&A approval", 
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await monthlyMonitoringAPI.deleteMonitoringEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-entries'] });
      toast({ title: "Success", description: "Monitoring entry deleted successfully" });
      refetchEntries();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete monitoring entry", 
        variant: "destructive" 
      });
    }
  });

  // Generate chart data with enhanced metrics
  const chartData = monitoringEntries.map((entry: MonthlyMonitoringEntry) => ({
    month: entry.monitoringMonth,
    target: entry.targetValue,
    achieved: entry.achievedValue || 0,
    deviation: entry.deviation || 0,
    deviationPercentage: entry.deviationPercentage || 0,
    kpi: entry.kpiDescription
  })).sort((a, b) => a.month.localeCompare(b.month));

  // Calculate summary statistics
  const summaryStats = {
    totalEntries: monitoringEntries.length,
    finalizedEntries: monitoringEntries.filter((e: MonthlyMonitoringEntry) => e.isFinalized).length,
    approvedEntries: monitoringEntries.filter((e: MonthlyMonitoringEntry) => e.faApproval).length,
    averageAchievement: monitoringEntries.length > 0 
      ? monitoringEntries.reduce((sum: number, e: MonthlyMonitoringEntry) => 
          sum + (e.achievedValue || 0), 0) / monitoringEntries.length 
      : 0,
    totalSavings: monitoringEntries.reduce((sum: number, e: MonthlyMonitoringEntry) => 
      sum + (e.achievedValue || 0), 0)
  };

  const pieData = [
    { name: 'Finalized', value: summaryStats.finalizedEntries, color: '#10b981' },
    { name: 'Pending', value: summaryStats.totalEntries - summaryStats.finalizedEntries, color: '#f59e0b' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kpiDescription || !formData.targetValue || !formData.monitoringMonth) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    // Validate month format
    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!monthRegex.test(formData.monitoringMonth!)) {
      toast({ title: "Error", description: "Please enter a valid month in YYYY-MM format", variant: "destructive" });
      return;
    }

    const entryData = {
      ...formData,
      isFinalized: false,
      faApproval: false,
      category: formData.category || 'General'
    } as MonthlyMonitoringEntry;

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id!, entry: entryData });
    } else {
      createMutation.mutate(entryData);
    }
  };

  const handleEdit = (entry: MonthlyMonitoringEntry) => {
    setEditingEntry(entry);
    setFormData(entry);
    setIsDialogOpen(true);
  };

  const canEdit = (entry: MonthlyMonitoringEntry) => {
    return (user.role === 'STLD' && user.email === entry.enteredBy) || 
           user.role === 'F&A Approver' || 
           user.role === 'ADMIN';
  };

  const canApprove = () => {
    return user.role === 'F&A Approver' || user.role === 'ADMIN';
  };

  const canFinalize = (entry: MonthlyMonitoringEntry) => {
    return (user.role === 'STLD' && user.email === entry.enteredBy) || user.role === 'ADMIN';
  };

  if (initiativesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        Loading Monthly Monitoring...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Savings Monitoring Sheet</h1>
          <p className="text-muted-foreground mt-1">Stage 9: Monthly monitoring and validation</p>
        </div>
        {selectedInitiativeId && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEntry(null); setFormData({}); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add KPI Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Edit KPI Entry' : 'Add Monthly KPI Entry'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="kpiDescription">KPI Description *</Label>
                    <Input
                      id="kpiDescription"
                      value={formData.kpiDescription || ''}
                      onChange={(e) => setFormData({ ...formData, kpiDescription: e.target.value })}
                      placeholder="Enter KPI description (e.g., Monthly Cost Savings)"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="monitoringMonth">Monitoring Month *</Label>
                    <Input
                      id="monitoringMonth"
                      type="month"
                      value={formData.monitoringMonth || ''}
                      onChange={(e) => setFormData({ ...formData, monitoringMonth: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category || 'General'} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Cost Savings">Cost Savings</SelectItem>
                        <SelectItem value="Quality Improvement">Quality Improvement</SelectItem>
                        <SelectItem value="Process Efficiency">Process Efficiency</SelectItem>
                        <SelectItem value="Safety Metrics">Safety Metrics</SelectItem>
                        <SelectItem value="Environmental">Environmental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetValue">Target Value (₹ Lakhs) *</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.targetValue || ''}
                      onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) })}
                      placeholder="Enter target value"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="achievedValue">Achieved Value (₹ Lakhs)</Label>
                    <Input
                      id="achievedValue"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.achievedValue || ''}
                      onChange={(e) => setFormData({ ...formData, achievedValue: parseFloat(e.target.value) })}
                      placeholder="Enter achieved value"
                    />
                  </div>
                </div>

                {formData.achievedValue && formData.targetValue && (
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Deviation:</strong> ₹{((formData.achievedValue - formData.targetValue)).toFixed(2)} Lakhs
                      ({(((formData.achievedValue - formData.targetValue) / formData.targetValue) * 100).toFixed(1)}%)
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="remarks">Remarks & Analysis</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks || ''}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Enter detailed remarks, analysis, and observations"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {editingEntry ? 'Update' : 'Create'} Entry
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedInitiativeId ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Assigned Initiatives</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Input
                  placeholder="Search initiatives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredInitiatives.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Savings Monitoring Access</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any initiatives assigned for Savings Monitoring (Stage 9).
                </p>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Savings Monitoring access is granted only after Stage 9 approval and when you are assigned as Site Lead (STLD).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {paginatedInitiatives.map((initiative: Initiative) => (
                  <Card
                    key={initiative.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => setSelectedInitiativeId(initiative.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg line-clamp-2">{initiative.initiativeNumber}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{initiative.title}</p>
                        </div>
                        <Badge variant="outline">{initiative.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <span className="w-16">Site:</span>
                          <span className="font-medium">{initiative.site}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-16">Lead:</span>
                          <span className="font-medium">{initiative.initiativeLead}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-16">Savings:</span>
                          <span className="font-medium text-green-600">₹{initiative.expectedSavings} Lakhs</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-16">Stage:</span>
                          <Badge variant="secondary" className="text-xs">Stage {initiative.currentStage}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                Monitoring for: {approvedInitiatives.find((i: Initiative) => i.id === selectedInitiativeId)?.initiativeNumber}
              </h2>
              <p className="text-sm text-muted-foreground">
                {approvedInitiatives.find((i: Initiative) => i.id === selectedInitiativeId)?.title}
              </p>
            </div>
            <Button variant="outline" onClick={() => setSelectedInitiativeId(null)}>
              Back to Initiatives
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="monthly">
                <Calendar className="h-4 w-4 mr-2" />
                Monthly View
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="summary">
                <PieChart className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {entriesLoading ? (
                <div className="flex justify-center items-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin mr-2" />
                  Loading monitoring entries...
                </div>
              ) : (
                <div className="space-y-4">
                  {monitoringEntries.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No monitoring entries found for this initiative.</p>
                        <p className="text-sm text-muted-foreground mt-2">Click "Add KPI Entry" to get started.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead>KPI Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Target (₹L)</TableHead>
                            <TableHead>Achieved (₹L)</TableHead>
                            <TableHead>Deviation</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {monitoringEntries.map((entry: MonthlyMonitoringEntry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium">{entry.monitoringMonth}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{entry.kpiDescription}</p>
                                  {entry.remarks && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{entry.remarks}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {entry.category || 'General'}
                                </Badge>
                              </TableCell>
                              <TableCell>₹{entry.targetValue}</TableCell>
                              <TableCell>
                                {entry.achievedValue ? `₹${entry.achievedValue}` : '-'}
                              </TableCell>
                              <TableCell>
                                {entry.deviation ? (
                                  <div className="flex items-center space-x-1">
                                    <span className={`font-medium ${entry.deviation < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                      ₹{entry.deviation.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      ({entry.deviationPercentage?.toFixed(1)}%)
                                    </span>
                                  </div>
                                ) : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {entry.isFinalized && (
                                    <Badge variant="outline" className="text-xs bg-blue-50">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Finalized
                                    </Badge>
                                  )}
                                  {entry.faApproval && (
                                    <Badge variant="outline" className="text-xs bg-green-50">
                                      <Target className="h-3 w-3 mr-1" />
                                      F&A Approved
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  {canEdit(entry) && (
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {canFinalize(entry) && !entry.isFinalized && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => finalizeMutation.mutate({ id: entry.id!, isFinalized: true })}
                                    >
                                      <FileText className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {canApprove() && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => faApprovalMutation.mutate({ id: entry.id!, faApproval: !entry.faApproval })}
                                    >
                                      <Target className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteMutation.mutate(entry.id!)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="monthly">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Label htmlFor="monthSelect">Select Month:</Label>
                  <Input
                    id="monthSelect"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-48"
                  />
                  <Badge variant="outline">
                    {monthlyEntries.length} entries found
                  </Badge>
                </div>

                {monthlyLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin mr-2" />
                    Loading monthly entries...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {monthlyEntries.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No entries found for {selectedMonth}.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      monthlyEntries.map((entry: MonthlyMonitoringEntry) => (
                        <Card key={entry.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">{entry.kpiDescription}</CardTitle>
                                <Badge variant="outline" className="mt-1">
                                  {entry.category || 'General'}
                                </Badge>
                              </div>
                              <div className="flex space-x-2">
                                {entry.isFinalized && <Badge variant="outline">Finalized</Badge>}
                                {entry.faApproval && <Badge variant="outline">F&A Approved</Badge>}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <Label className="text-sm font-medium text-blue-600">Target Value</Label>
                                <p className="text-2xl font-bold text-blue-700">₹{entry.targetValue}</p>
                                <p className="text-xs text-blue-500">Lakhs</p>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <Label className="text-sm font-medium text-green-600">Achieved Value</Label>
                                <p className="text-2xl font-bold text-green-700">₹{entry.achievedValue || '-'}</p>
                                <p className="text-xs text-green-500">Lakhs</p>
                              </div>
                              <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <Label className="text-sm font-medium text-purple-600">Deviation</Label>
                                <p className={`text-2xl font-bold ${entry.deviation && entry.deviation < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {entry.deviation ? `₹${entry.deviation.toFixed(2)}` : '-'}
                                </p>
                                <p className="text-xs text-purple-500">
                                  {entry.deviationPercentage ? `${entry.deviationPercentage.toFixed(1)}%` : ''}
                                </p>
                              </div>
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Label className="text-sm font-medium text-gray-600">Performance</Label>
                                <p className="text-2xl font-bold text-gray-700">
                                  {entry.achievedValue && entry.targetValue 
                                    ? `${((entry.achievedValue / entry.targetValue) * 100).toFixed(0)}%`
                                    : '-'}
                                </p>
                                <p className="text-xs text-gray-500">Achievement</p>
                              </div>
                            </div>

                            {entry.remarks && (
                              <div className="mb-4 p-3 bg-muted rounded-lg">
                                <Label className="text-sm font-medium text-muted-foreground">Remarks & Analysis</Label>
                                <p className="text-sm mt-1">{entry.remarks}</p>
                              </div>
                            )}

                            {entry.faComments && (
                              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <Label className="text-sm font-medium text-yellow-600">F&A Comments</Label>
                                <p className="text-sm text-yellow-700 mt-1">{entry.faComments}</p>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-3 border-t">
                              {canEdit(entry) && (
                                <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              )}
                              {canFinalize(entry) && !entry.isFinalized && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => finalizeMutation.mutate({ id: entry.id!, isFinalized: true })}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Finalize
                                </Button>
                              )}
                              {canApprove() && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => faApprovalMutation.mutate({ id: entry.id!, faApproval: !entry.faApproval })}
                                >
                                  <Target className="h-4 w-4 mr-2" />
                                  {entry.faApproval ? 'Remove' : 'Give'} F&A Approval
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                {chartData.length > 0 ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Performance Trend Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="target" stroke="#3b82f6" name="Target" strokeWidth={2} />
                            <Line type="monotone" dataKey="achieved" stroke="#10b981" name="Achieved" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Target vs Achieved Comparison</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="target" fill="#3b82f6" name="Target" />
                            <Bar dataKey="achieved" fill="#10b981" name="Achieved" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No data available for analytics.</p>
                      <p className="text-sm text-muted-foreground mt-2">Add some monitoring entries to see analytics.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <h3 className="text-2xl font-bold text-blue-600">{summaryStats.totalEntries}</h3>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <h3 className="text-2xl font-bold text-green-600">{summaryStats.finalizedEntries}</h3>
                    <p className="text-sm text-muted-foreground">Finalized</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Target className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <h3 className="text-2xl font-bold text-purple-600">{summaryStats.approvedEntries}</h3>
                    <p className="text-sm text-muted-foreground">F&A Approved</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                    <h3 className="text-2xl font-bold text-yellow-600">₹{summaryStats.totalSavings.toFixed(1)}</h3>
                    <p className="text-sm text-muted-foreground">Total Savings (Lakhs)</p>
                  </CardContent>
                </Card>
              </div>

              {pieData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Entry Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPieChart>
                          <Tooltip />
                          <RechartsPieChart data={pieData} cx="50%" cy="50%" outerRadius={80}>
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </RechartsPieChart>
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Key Performance Indicators</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Completion Rate</span>
                        <span className="font-medium">
                          {summaryStats.totalEntries > 0 
                            ? `${((summaryStats.finalizedEntries / summaryStats.totalEntries) * 100).toFixed(1)}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Approval Rate</span>
                        <span className="font-medium">
                          {summaryStats.finalizedEntries > 0 
                            ? `${((summaryStats.approvedEntries / summaryStats.finalizedEntries) * 100).toFixed(1)}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average Achievement</span>
                        <span className="font-medium">₹{summaryStats.averageAchievement.toFixed(2)}L</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}