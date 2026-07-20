export type CallSignalType = "OFFER" | "ANSWER" | "ICE_CANDIDATE" | "END" | "REJECT" | "BUSY";

export interface CallSignal {
    type: CallSignalType;
    from?: string;
    to: string;
    sdp?: string;
    candidate?: string;
    callId: string;
}

export type CallStatus = "idle" | "calling" | "ringing" | "connected";