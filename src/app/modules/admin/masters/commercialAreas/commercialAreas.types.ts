
export interface CommercialArea
{
    id: number;
    code: string;
    isActive: number;
    name: string;
    description: string;
}

export type CreateCommercialArea = Omit<CommercialArea, 'id'>;
