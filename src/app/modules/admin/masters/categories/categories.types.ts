
export interface Category
{
    id: number;
    code: string;
    isActive: number;
    name: string;
    description: string;
}

export type CreateCategory = Omit<Category, 'id'>;
