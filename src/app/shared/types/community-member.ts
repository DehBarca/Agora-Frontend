export interface CommunityMember {
    _id?: string,
    userId: string,
    communityId: string,
    role: 'admin' | 'member'
}
