import React from 'react';
import { useCurrentPendingStage } from '@/hooks/useWorkflowTransactions';

interface CurrentStageProps {
  initiativeId: number | string;
  fallbackStage?: number;
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

export default function CurrentStage({ initiativeId, fallbackStage = 1 }: CurrentStageProps) {
  const { data: currentStageData, isLoading } = useCurrentPendingStage(Number(initiativeId));
  
  const stageName = currentStageData?.stageName || 
    WORKFLOW_STAGE_NAMES[fallbackStage] || 
    'Register Initiative';

  if (isLoading) {
    return <span className="text-muted-foreground animate-pulse">Loading...</span>;
  }

  return <span className="font-medium">{stageName}</span>;
}