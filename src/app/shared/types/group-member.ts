export interface GroupMember {
		_id?: string,
        userId: string,
		groupId:string,
		role: 'admin' | 'member',
}
