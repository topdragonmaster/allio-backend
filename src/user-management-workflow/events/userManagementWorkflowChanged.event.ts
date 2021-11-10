import { ManagementWorkflow } from '../../management-workflow/entities/managementWorkflow.entity';

export const USER_MANAGEMENT_WORKFLOW_CHANGED =
  'user_management_workflow.changed';

export class UserManagementWorkflowChangedEvent {
  public constructor(
    public readonly userId: string,
    public readonly currentManagementWorkflow: ManagementWorkflow,
    public readonly previousManagementWorkflow?: ManagementWorkflow
  ) {}
}
