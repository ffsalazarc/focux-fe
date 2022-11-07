
export interface Department
{
    id: number;
    code: string;
    isActive: number;
    name: string;
    description: string;
}

export type CreateDepartment = Omit<Department, 'id'>;
