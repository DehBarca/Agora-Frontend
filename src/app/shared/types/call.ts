export interface Peer {
    id: string;
    audioProducerId?: string;
    videoProducerId?: string;
    audioConsumerId?: string;
    videoConsumerId?: string;
    stream?: MediaStream;
}  

export interface RoomJoinedResponse {
    rtpCapabilities: any;
    peers: string[];
}

export interface CreateTransportResponse {
    id: string;
    iceParameters: any;
    iceCandidates: any[];
    dtlsParameters: any;
}

export interface ProduceResponse {
    id: string;
}

export interface ConsumeResponse {
    id: string;
    producerId: string;
    kind: 'audio' | 'video';
    rtpParameters: any;
}

export interface NewProducerEvent {
    peerId: string;
    producerId: string;
    kind: 'audio' | 'video';
}
