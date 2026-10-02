// The CRM lead a task was created for (a follow-up booked in the CRM), as the
// CRM has it right now.
export type TaskCrmLead = {
  id: string;
  number: number;
  contactName: string;
  businessName: string | null;
  phone: string;
  email: string | null;
  priority: string;
  stage: { name: string; color: string };
  archived: boolean;
};
