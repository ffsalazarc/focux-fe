
export interface TypeRequest
{
    id: number;
    code: string;
    isActive: number;
    name: string;
    description: string;
}

export type CreateTypeRequest = Omit<TypeRequest, 'id'>;
