
export interface TechnicalArea
{
    id: number;
    code: string;
    isActive: number;
    name: string;
    description: string;
}

export type CreateTechnicalArea = Omit<TechnicalArea, 'id'>;
