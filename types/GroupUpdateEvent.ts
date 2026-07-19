export interface GroupUpdateEvent {

    type: "ADDED" | "DELETED";

    groupId: number;

    groupName?: string;

    role?: string;

}