import { Injectable } from '@angular/core';
import { Device } from 'mediasoup-client';
import { Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    Peer,
    RoomJoinedResponse,
    CreateTransportResponse,
    ProduceResponse,
    ConsumeResponse,
    NewProducerEvent,
} from '../types/call';

@Injectable({
    providedIn: 'root',
})
export class CallService {
    private device?: Device;
    private sendTransport?: any;
    private recvTransport?: any;
    private audioProducer?: any;
    private videoProducer?: any;

    private localStream$ = new BehaviorSubject<MediaStream | null>(null);
    private peers$ = new BehaviorSubject<Map<string, Peer>>(new Map());
    private isInCall$ = new BehaviorSubject<boolean>(false);

    // Observables públicos
    localStream: Observable<MediaStream | null> =
        this.localStream$.asObservable();
    peers: Observable<Map<string, Peer>> = this.peers$.asObservable();
    isInCall: Observable<boolean> = this.isInCall$.asObservable();

    constructor() {}

    /**
     * Inicializa el dispositivo mediasoup
     */
    async initDevice(rtpCapabilities: any): Promise<void> {
        try {
            this.device = new Device();
            await this.device.load({ routerRtpCapabilities: rtpCapabilities });
            console.log('[Call] Device inicializado');
        } catch (error) {
            console.error('[Call] Error inicializando device:', error);
            throw error;
        }
    }

    /**
     * Crea el transport para enviar (produce)
     */
    async createSendTransport(socket: Socket, roomId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            socket.emit(
                'createWebRtcTransport',
                { roomId, consumer: false },
                async (data: CreateTransportResponse | { error: string }) => {
                    if ('error' in data) {
                        reject(data.error);
                        return;
                    }

                    try {
                        this.sendTransport = this.device!.createSendTransport({
                            id: data.id,
                            iceParameters: data.iceParameters,
                            iceCandidates: data.iceCandidates,
                            dtlsParameters: data.dtlsParameters,
                        });

                        // Event: connect
                        this.sendTransport.on(
                            'connect',
                            async (
                                { dtlsParameters }: any,
                                callback: any,
                                errback: any
                            ) => {
                                try {
                                    socket.emit(
                                        'connectTransport',
                                        {
                                            transportId: this.sendTransport!.id,
                                            dtlsParameters,
                                        },
                                        (response: any) => {
                                            if (response.error) {
                                                errback(
                                                    new Error(response.error)
                                                );
                                            } else {
                                                callback();
                                            }
                                        }
                                    );
                                } catch (error: any) {
                                    errback(error);
                                }
                            }
                        );

                        // Event: produce
                        this.sendTransport.on(
                            'produce',
                            async (
                                { kind, rtpParameters }: any,
                                callback: any,
                                errback: any
                            ) => {
                                try {
                                    socket.emit(
                                        'produce',
                                        {
                                            transportId: this.sendTransport!.id,
                                            kind,
                                            rtpParameters,
                                        },
                                        (
                                            response:
                                                | ProduceResponse
                                                | { error: string }
                                        ) => {
                                            if ('error' in response) {
                                                errback(
                                                    new Error(response.error)
                                                );
                                            } else {
                                                callback({ id: response.id });
                                            }
                                        }
                                    );
                                } catch (error: any) {
                                    errback(error);
                                }
                            }
                        );

                        console.log('[Call] Send transport creado');
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    }

    /**
     * Crea el transport para recibir (consume)
     */
    async createRecvTransport(socket: Socket, roomId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            socket.emit(
                'createWebRtcTransport',
                { roomId, consumer: true },
                async (data: CreateTransportResponse | { error: string }) => {
                    if ('error' in data) {
                        reject(data.error);
                        return;
                    }

                    try {
                        this.recvTransport = this.device!.createRecvTransport({
                            id: data.id,
                            iceParameters: data.iceParameters,
                            iceCandidates: data.iceCandidates,
                            dtlsParameters: data.dtlsParameters,
                        });

                        // Event: connect
                        this.recvTransport.on(
                            'connect',
                            async (
                                { dtlsParameters }: any,
                                callback: any,
                                errback: any
                            ) => {
                                try {
                                    socket.emit(
                                        'connectTransport',
                                        {
                                            transportId: this.recvTransport!.id,
                                            dtlsParameters,
                                        },
                                        (response: any) => {
                                            if (response.error) {
                                                errback(
                                                    new Error(response.error)
                                                );
                                            } else {
                                                callback();
                                            }
                                        }
                                    );
                                } catch (error: any) {
                                    errback(error);
                                }
                            }
                        );

                        console.log('[Call] Recv transport creado');
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    }

    /**
     * Produce audio/video (enviar al servidor)
     */
    async produce(
        track: MediaStreamTrack,
        kind: 'audio' | 'video'
    ): Promise<void> {
        try {
            const producer = await this.sendTransport!.produce({ track });

            if (kind === 'audio') {
                this.audioProducer = producer;
            } else {
                this.videoProducer = producer;
            }

            console.log(
                `[Call] Producing ${kind}, producer ID: ${producer.id}`
            );
        } catch (error) {
            console.error(`[Call] Error producing ${kind}:`, error);
            throw error;
        }
    }

    /**
     * Consume audio/video de otro peer
     */
    async consume(
        socket: Socket,
        producerId: string,
        kind: 'audio' | 'video',
        peerId: string
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            socket.emit(
                'consume',
                {
                    transportId: this.recvTransport!.id,
                    producerId,
                    rtpCapabilities: this.device!.rtpCapabilities,
                },
                async (data: ConsumeResponse | { error: string }) => {
                    if ('error' in data) {
                        reject(data.error);
                        return;
                    }

                    try {
                        const consumer: any = await this.recvTransport!.consume(
                            {
                                id: data.id,
                                producerId: data.producerId,
                                kind: data.kind,
                                rtpParameters: data.rtpParameters,
                            }
                        );

                        console.log(
                            `[Call] Consumer creado para ${kind}, track:`,
                            consumer.track
                        );

                        // Reanudar el consumer
                        socket.emit(
                            'resumeConsumer',
                            { consumerId: consumer.id },
                            () => {
                                console.log(
                                    `[Call] Consumer ${kind} reanudado para peer ${peerId}`
                                );
                            }
                        );

                        // Agregar el track al peer
                        const peers = this.peers$.value;
                        const peer = peers.get(peerId) || { id: peerId };

                        if (!peer.stream) {
                            peer.stream = new MediaStream();
                            console.log(
                                `[Call] Nuevo stream creado para peer ${peerId}`
                            );

                            // Agregar listener para cuando se agreguen tracks
                            peer.stream.onaddtrack = (event) => {
                                console.log(
                                    `[Call] Track agregado al stream de peer ${peerId}:`,
                                    event.track.kind
                                );
                                // Forzar actualización de peers para que Angular detecte el cambio
                                this.peers$.next(new Map(this.peers$.value));
                            };
                        }

                        peer.stream.addTrack(consumer.track);
                        console.log(
                            `[Call] Track ${kind} agregado a peer ${peerId}. Total tracks:`,
                            peer.stream.getTracks().length
                        );

                        if (kind === 'audio') {
                            peer.audioConsumerId = consumer.id;
                        } else {
                            peer.videoConsumerId = consumer.id;
                        }

                        peers.set(peerId, peer);
                        this.peers$.next(new Map(peers));

                        console.log(
                            `[Call] Consuming ${kind} from peer ${peerId}. Stream:`,
                            peer.stream
                        );
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    }

    /**
     * Obtiene el stream local (cámara y micrófono)
     */
    async getLocalStream(audio = true, video = true): Promise<MediaStream> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio,
                video: video
                    ? {
                          width: { ideal: 640 }, 
                          height: { ideal: 480 }, 
                          frameRate: { ideal: 24 },
                      }
                    : false,
            });

            this.localStream$.next(stream);
            console.log('[Call] Stream local obtenido');
            return stream;
        } catch (error) {
            console.error('[Call] Error obteniendo stream local:', error);
            throw error;
        }
    }

    /**
     * Agrega un peer remoto
     */
    addPeer(peerId: string): void {
        const peers = this.peers$.value;
        if (!peers.has(peerId)) {
            peers.set(peerId, { id: peerId });
            this.peers$.next(new Map(peers));
            console.log(`[Call] Peer agregado: ${peerId}`);
        }
    }

    /**
     * Remueve un peer remoto
     */
    removePeer(peerId: string): void {
        const peers = this.peers$.value;
        const peer = peers.get(peerId);

        if (peer?.stream) {
            peer.stream.getTracks().forEach((track) => track.stop());
        }

        peers.delete(peerId);
        this.peers$.next(new Map(peers));
        console.log(`[Call] Peer removido: ${peerId}`);
    }

    /**
     * Establece el estado de la llamada
     */
    setInCall(inCall: boolean): void {
        this.isInCall$.next(inCall);
    }

    /**
     * Limpia todo al salir de la llamada
     */
    cleanup(): void {
        // Detener stream local
        const localStream = this.localStream$.value;
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
            this.localStream$.next(null);
        }

        // Cerrar producers
        this.audioProducer?.close();
        this.videoProducer?.close();

        // Cerrar transports
        this.sendTransport?.close();
        this.recvTransport?.close();

        // Limpiar peers
        const peers = this.peers$.value;
        peers.forEach((peer) => {
            if (peer.stream) {
                peer.stream.getTracks().forEach((track) => track.stop());
            }
        });
        this.peers$.next(new Map());

        this.isInCall$.next(false);
        console.log('[Call] Limpieza completada');
    }

    /**
     * Toggles (activar/desactivar) audio
     */
    toggleAudio(): boolean {
        if (this.audioProducer) {
            if (this.audioProducer.paused) {
                this.audioProducer.resume();
                return true;
            } else {
                this.audioProducer.pause();
                return false;
            }
        }
        return false;
    }

    /**
     * Toggles (activar/desactivar) video
     */
    toggleVideo(): boolean {
        if (this.videoProducer) {
            if (this.videoProducer.paused) {
                this.videoProducer.resume();
                return true;
            } else {
                this.videoProducer.pause();
                return false;
            }
        }
        return false;
    }
}
