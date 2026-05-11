import { MessageType } from "./message-type"

export interface EventData {
    title: string;
    date: string; 
    participants?: string[];
}

export interface Message {
    _id?: string
    username: string,
    groupId: string,
    userId: string,
    type: MessageType,
    imageUrl?: String,
    text: string,
    eventData?: EventData, 
    createdAt?: string
}