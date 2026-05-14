import { GroupMember } from "./group-member";
import { User } from "./user";

export interface GetGroupMembersResponse extends Omit<GroupMember, 'userId'>{
    userId: User;
}
