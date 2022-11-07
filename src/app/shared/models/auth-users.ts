import { Collaborator } from "app/modules/admin/dashboards/collaborators/collaborators.types";

export interface AuthUsers {
    authorization: { authority: string }[];
    token: string;
    username: string;
    names: string,
    email: string,
    collaborator: Collaborator,
}
