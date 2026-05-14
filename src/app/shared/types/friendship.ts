export interface Friendship {
    _id?: string,
    userId: string,
    friendId: string,
    status: 'pending' | 'accepted' | 'blocked' | 'muted'
}
