import { CommunityMember } from "./community-member";
import { User } from "./user";

export interface GetCommunityMembersResponse extends Omit<CommunityMember, 'userId'>{
    userId: User;
}
