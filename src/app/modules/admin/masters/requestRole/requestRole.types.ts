
export interface RequestRole
{
    id: number;
    isActive: number;
    name: string;
    description: string;
}

export type CreateRequestRole = Omit<RequestRole, 'id'>;
