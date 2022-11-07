
export interface Knowledge
{
    id: number;
    type: string;
    isActive: number;
    name: string;
    description: string;
}

export type CreatevKnowledge = Omit<Knowledge, 'id'>;
