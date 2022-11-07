
export interface BusinessType
{
    id: number;
    code: string;
    isActive: number;
    name: string;
    description: string;
}

export type CreateBusinessType = Omit<BusinessType, 'id'>;
