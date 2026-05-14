import { Group } from "./group";
import { GroupMember } from "./group-member";

export interface DeleteGroupResponse {
    deletedGroup: Group,
    deletedMembers: GroupMember[]
}
