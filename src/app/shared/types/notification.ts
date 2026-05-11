import { NotificationType } from "./notification-type";

export interface Notification {
    _id?: string,
    receiverId: string,
    type: NotificationType,
    data: any,
    seen: boolean,
}
