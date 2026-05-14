import { Friendship } from "./friendship";
import { User } from "./user";

export interface GetFriendsResponse extends Omit<Friendship, 'friendId'>{
    friendId: User;
}
