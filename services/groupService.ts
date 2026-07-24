import { API_URL as API } from '../config/apiConfig';

function getAuthHeaders() {

    const token = localStorage.getItem("chat_token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };

}

export interface GroupInfo {
    id: number;
    name: string;
    role?: string;
}

export async function createGroup(name: string): Promise<GroupInfo> {

    const response = await fetch(`${API}/api/groups/create`, {

        method: "POST",

        headers: getAuthHeaders(),

        body: JSON.stringify({ groupName: name })

    });

    if (!response.ok) {
        throw new Error("خطا در ساخت گروه");
    }

    const data = await response.json();

    return { id: data.id, name: data.name, role: 'ADMIN' };

}

export async function addMemberToGroup(groupId: number | string, username: string, role: string = "MEMBER") {

    const response = await fetch(`${API}/api/groups/${groupId}/add-member`, {

        method: "POST",

        headers: getAuthHeaders(),

        body: JSON.stringify({ username, role })

    });

    if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg);
    }

    return await response.json();

}

export async function getGroupById(groupId: number): Promise<GroupInfo> {

    const response = await fetch(`${API}/api/groups/${groupId}`, {

        method: "GET",

        headers: getAuthHeaders()

    });

    if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات گروه");
    }

    const data = await response.json();

    return { 
        id: data.id, 
        name: data.name || `گروه #${data.id}` 
    };

}

export async function getUserGroups(): Promise<GroupInfo[]> {
    const response = await fetch(`${API}/api/groups/my-groups`, {
        method: "GET",
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error("خطا در دریافت لیست گروه‌ها");
    }
    const memberships = await response.json();
    const groupDetails = await Promise.all(
        memberships.map(async (member: any) => {
            try {
                const group = await getGroupById(member.groupId);
                return { id: group.id, name: group.name, role: member.role };
            } catch {
                return { id: member.groupId, name: `گروه #${member.groupId}`, role: member.role };
            }
        })
    );
    return groupDetails;
}

export async function deleteGroup(groupId: number): Promise<void> {
    const response = await fetch(`${API}/api/groups/${groupId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "خطا در حذف گروه");
    }
}
