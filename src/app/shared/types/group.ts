import { List } from "./list";
import { Message } from "./message";

export interface Group {
    _id?: string;
    communityId?: string,
    topic: string,
    description?: string,
    lastMessage?: Message,
    listIds?: List,
    groupImgUrl?: string
}
