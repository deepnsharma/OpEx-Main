import { useState } from "react";
import { User } from "@/lib/mockData";
import { useInitiatives } from "@/hooks/useInitiatives";
import { 
  useWorkflowTransactions, 
  usePendingTransactionsByRole, 
  useProcessStageAction 
} from "@/hooks/useWorkflowTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, ArrowLeft, User as UserIcon } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import WorkflowStageModal from "@/components/workflow/WorkflowStageModal";

interface NewWorkflowProps {
  user: User;
}

export default function NewWorkflow({ user }: NewWorkflowProps) {
  const [selectedInitiative, setSelectedInitiative] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: initiativesData } = useInitiatives();
  const { data: workflowTransactions = [], refetch: refetchTransactions } = useWorkflowTransactions(selectedInitiative || 0);
  const { data: pendingTransactions = [] } = usePendingTransactionsByRole(user.role || "");
  const processStageAction = useProcessStageAction();
  
  // Mock data fallback
  const mockInitiatives = [
    {
      id: 1,
      title: "Process Improvement Initiative",
      status: "IN_PROGRESS",
      site: "Mumbai",
      initiativeLead: "John Doe",
      expectedSavings: 150,
      currentStage: 2
    },
    {
      id: 2,
      title: "Cost Reduction Program",
      status: "PLANNING",
      site: "Delhi",
      initiativeLead: "Jane Smith",
      expectedSavings: 200,
      currentStage: 1
    }
  ];
  
  const initiatives = (Array.isArray(initiativesData?.content) && initiativesData.content.length > 0) 
    ? initiativesData.content 
    : (Array.isArray(initiativesData) && initiativesData.length > 0) 
    ? initiativesData 
    : mockInitiatives;

  const itemsPerPage = 6;
  const totalPages = Math.ceil(initiatives.length / itemsPerPage);
  const paginatedInitiatives = initiatives.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleProcessStage = (data: any) => {
    processStageAction.mutate(data, {
      onSuccess: () => {
        toast({ 
          title: data.action === 'approved' ? "Stage approved successfully" : "Stage rejected",
          description: "The workflow has been updated."
        });
        refetchTransactions();
        setIsModalOpen(false);
        setSelectedTransaction(null);
      },
      onError: (error: any) => {
        toast({ 
          title: "Error processing stage", 
          description: error.response?.data?.message || "Something went wrong",
          variant: "destructive" 
        });
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'pending': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleCodeDescription = (roleCode: string) => {
    const roles: { [key: string]: string } = {
      'STLD': 'Site TSD Lead',
      'SH': 'Site Head',
      'EH': 'Engineering Head',
      'IL': 'Initiative Lead',
      'CTSD': 'Corp TSD'
    };
    return roles[roleCode] || roleCode;
  };

  const selectedInitiativeData = initiatives.find((i: any) => i.id === selectedInitiative);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workflow Management</h1>
        <p className="text-muted-foreground">Manage approval workflows with role-based permissions</p>
      </div>

      <Tabs defaultValue="stages" className="w-full">
        <TabsList>
          <TabsTrigger value="stages">Initiative Workflow</TabsTrigger>
          <TabsTrigger value="pending">
            My Pending Actions ({pendingTransactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stages" className="space-y-6">
          {!selectedInitiative ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Select Initiative</h2>
              
              <div className="space-y-4">
                {paginatedInitiatives.map((initiative: any) => (
                  <Card
                    key={initiative.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
                    onClick={() => setSelectedInitiative(initiative.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{initiative.initiativeNumber || initiative.title}</h3>
                            <Badge className={getStatusColor(initiative.status)}>
                              {initiative.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Site:</span>
                              <p className="font-medium">{initiative.site}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Initiative Lead:</span>
                              <p className="font-medium">{initiative.initiativeLead || 'Not Assigned'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current Stage:</span>
                              <p className="font-medium">Stage {initiative.currentStage || 1}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expected Savings:</span>
                              <p className="font-medium">${initiative.expectedSavings || 0}K</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{Math.round(((initiative.currentStage || 1) - 1) * 100 / 11)}%</span>
                            </div>
                            <Progress value={Math.round(((initiative.currentStage || 1) - 1) * 100 / 11)} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="ml-6">
                          <Button variant="outline" size="sm">
                            View Workflow →
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink 
                          href="#" 
                          isActive={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setSelectedInitiative(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Initiatives
                </Button>
                <div>
                  <h2 className="text-2xl font-semibold">{selectedInitiativeData?.title}</h2>
                  <p className="text-muted-foreground">Workflow Stages</p>
                </div>
              </div>
              
              {workflowTransactions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No workflow stages found for this initiative.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {workflowTransactions.map((transaction: any) => (
                    <Card key={transaction.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                              {transaction.stageNumber}
                            </div>
                            <div>
                              <CardTitle className="text-xl">
                                {transaction.stageName}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Required Role: <span className="font-medium">{getRoleCodeDescription(transaction.requiredRole)}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusIcon(transaction.approveStatus)}
                            <Badge className={getStatusColor(transaction.approveStatus)}>
                              {transaction.approveStatus?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {transaction.actionBy && (
                          <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <UserIcon className="h-4 w-4" />
                            <span>
                              {transaction.approveStatus === 'approved' ? 'Approved' : 'Rejected'} by: 
                              <span className="font-medium ml-1">{transaction.actionBy}</span>
                            </span>
                            {transaction.actionDate && (
                              <span className="text-muted-foreground">
                                on {new Date(transaction.actionDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {transaction.comment && (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium mb-1">Comments:</p>
                            <p className="text-sm">{transaction.comment}</p>
                          </div>
                        )}

                        {/* Show additional info for specific stages */}
                        {transaction.assignedUserId && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                            <span className="font-medium">Assigned Initiative Lead ID:</span>
                            <span className="ml-2">{transaction.assignedUserId}</span>
                          </div>
                        )}

                        {/* Next pending stage info */}
                        {workflowTransactions.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                            {(() => {
                              const nextPendingTransaction = workflowTransactions.find((t: any) => t.approveStatus === 'pending');
                              if (nextPendingTransaction) {
                                return (
                                  <>
                                    <span className="font-medium">Next Pending:</span>
                                    <span className="ml-2">
                                      Stage {nextPendingTransaction.stageNumber}: {nextPendingTransaction.stageName} 
                                      (Pending with: {getRoleCodeDescription(nextPendingTransaction.requiredRole)})
                                    </span>
                                  </>
                                );
                              }
                              return (
                                <>
                                  <span className="font-medium">Status:</span>
                                  <span className="ml-2 text-green-600">All stages completed</span>
                                </>
                              );
                            })()}
                          </div>
                        )}

                        {transaction.approveStatus === 'pending' && transaction.requiredRole === user.role && (
                          <div className="border-t pt-4">
                            <Button 
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setIsModalOpen(true);
                              }}
                              className="w-full"
                            >
                              Process This Stage
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">My Pending Actions</h2>
            <p className="text-muted-foreground">Stages waiting for your approval ({user.role})</p>
          </div>
          
          {pendingTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Actions</h3>
                <p className="text-muted-foreground">All caught up! No stages require your approval at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pendingTransactions.map((transaction: any) => (
                <Card key={transaction.id} className="border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Initiative ID: {transaction.initiativeId}
                        </CardTitle>
                        <p className="text-lg text-muted-foreground">
                          Stage {transaction.stageNumber}: {transaction.stageName}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500 text-black">PENDING</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-muted p-4 rounded-lg">
                      <div>
                        <span className="font-medium text-muted-foreground">Site:</span>
                        <p className="font-medium">{transaction.site}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Required Role:</span>
                        <p className="font-medium">{getRoleCodeDescription(transaction.requiredRole)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Created:</span>
                        <p className="font-medium">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setIsModalOpen(true);
                      }}
                      className="w-full"
                    >
                      Process This Stage
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Workflow Stage Modal */}
      <WorkflowStageModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        userRole={user.role || ""}
        onProcess={handleProcessStage}
        isLoading={processStageAction.isPending}
      />
    </div>
  );
}