import { Friendship } from "./friendship";
import { User } from "./user";

export interface GetReceivedRequestsResponse extends Omit<Friendship, 'userId'>{
    userId: User;
}