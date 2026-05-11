import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
    ViewChildren,
    QueryList,
    AfterViewChecked,
    Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallService } from '../../services/call.service';
import { SocketService } from '../../services/socket.service';
import { Peer } from '../../types/call';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ModalsService } from '../../services/modals.service';
import { Group } from '../../types/group';
import { GroupService } from '../../services/group.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-video-call',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './video-call.component.html',
    styleUrl: './video-call.component.scss',
})
export class VideoCallComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('localVideo', { static: false })
    localVideo!: ElementRef<HTMLVideoElement>;
    @ViewChildren('remoteVideo') remoteVideos!: QueryList<
        ElementRef<HTMLVideoElement>
    >;

    localStream: MediaStream | null = null;
    remotePeers: Peer[] = [];

    isAudioEnabled = true;
    isVideoEnabled = true;
    isInCall = false;

    @Input() roomId: string = '';
    peerId = `peer-${Math.random().toString(36).substr(2, 9)}`;
    @Input() group: Group = { topic: '' };
    private subscriptions: Subscription[] = [];

    constructor(
        private callService: CallService,
        private socketService: SocketService,
        private route: ActivatedRoute,
        private modalsService: ModalsService,
        private groupService: GroupService
    ) {}

    ngOnInit(): void {
        // Suscribirse al stream local
        this.subscriptions.push(
            this.callService.localStream.subscribe((stream) => {
                this.localStream = stream;
                console.log('[VideoCall] Stream local recibido:', stream);
                // Intentar asignar el stream al video
                this.updateLocalVideo();
            })
        );

        // Suscribirse a los peers remotos
        this.subscriptions.push(
            this.callService.peers.subscribe((peers) => {
                this.remotePeers = Array.from(peers.values());
            })
        );

        // Suscribirse al estado de la llamada
        this.subscriptions.push(
            this.callService.isInCall.subscribe((inCall) => {
                this.isInCall = inCall;
            })
        );

        // Escuchar eventos de socket
        this.setupSocketListeners();
        if(!this.group._id || this.group._id === ''){
            this.groupService.getGroupSummary().subscribe((group:Group)=> {
                this.group = group
                this.roomId = group._id!;
                console.log(group)
                this.joinCall();
            })
        }

    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.leaveCall();
    }

    ngAfterViewChecked(): void {
        // Actualizar video local
        this.updateLocalVideo();

        // Actualizar los videos remotos cuando la vista cambia
        if (this.remoteVideos) {
            this.remoteVideos.forEach((videoRef) => {
                const videoElement = videoRef.nativeElement;
                const peerId = videoElement.getAttribute('data-peer-id');
                const peer = this.remotePeers.find((p) => p.id === peerId);

                if (peer) {
                    if (peer.stream) {
                        const videoTracks = peer.stream.getVideoTracks();
                        const audioTracks = peer.stream.getAudioTracks();
                        const streamChanged = videoElement.srcObject !== peer.stream;
                        
                        console.log(
                            `[VideoCall] Debug peer ${peerId}:`,
                            {
                                hasStream: !!peer.stream,
                                videoTracks: videoTracks.length,
                                audioTracks: audioTracks.length,
                                streamChanged,
                                currentSrcObject: !!videoElement.srcObject,
                                videoTrackEnabled: videoTracks[0]?.enabled,
                                audioTrackEnabled: audioTracks[0]?.enabled,
                                trackStates: videoTracks.concat(audioTracks).map(track => ({
                                    kind: track.kind,
                                    enabled: track.enabled,
                                    readyState: track.readyState
                                }))
                            }
                        );

                        if (streamChanged || !videoElement.srcObject) {
                            console.log(
                                `[VideoCall] Asignando stream a video de peer ${peerId}`
                            );
                            videoElement.srcObject = peer.stream;
                            
                            // Agregar listeners para depuración
                            videoElement.onloadedmetadata = () => {
                                console.log(`[VideoCall] Metadata cargada para peer ${peerId}`);
                            };
                            
                            videoElement.oncanplay = () => {
                                console.log(`[VideoCall] Video puede reproducirse para peer ${peerId}`);
                            };
                            
                            videoElement.onerror = (error) => {
                                console.error(`[VideoCall] Error en video de peer ${peerId}:`, error);
                            };
                        }
                    } else {
                        console.warn(`[VideoCall] Peer ${peerId} no tiene stream`);
                    }
                } else {
                    console.warn(`[VideoCall] No se encontró peer para ${peerId}`);
                }
            });
        }
    }

    /**
     * Actualiza el video local
     */
    private updateLocalVideo(): void {
        if (this.localStream && this.localVideo) {
            const videoElement = this.localVideo.nativeElement;
            if (videoElement.srcObject !== this.localStream) {
                console.log('[VideoCall] Asignando stream local al video');
                videoElement.srcObject = this.localStream;
                videoElement.muted = true;
                videoElement.volume = 0;
            }
        }
    }

    /**
     * Configurar listeners de socket.io
     */
    private setupSocketListeners(): void {
        // Esperar a que el socket esté listo
        const checkSocket = () => {
            const socket = this.socketService.getSocket();

            if (!socket) {
                console.log('[VideoCall] Esperando conexión de socket...');
                setTimeout(checkSocket, 500);
                return;
            }

            console.log('[VideoCall] Socket listo, configurando listeners');

            // Cuando te unes a la sala exitosamente
            socket.on('callRoomJoined', async (data: any) => {
                console.log('[VideoCall] Unido a sala:', data);

                try {
                    // Inicializar device con las capabilities del router
                    await this.callService.initDevice(data.rtpCapabilities);

                    // Crear transports
                    await this.callService.createSendTransport(
                        socket,
                        this.roomId
                    );
                    await this.callService.createRecvTransport(
                        socket,
                        this.roomId
                    );

                    // Obtener stream local
                    const stream = await this.callService.getLocalStream(
                        true,
                        true
                    );

                    // Producir audio y video
                    const audioTrack = stream.getAudioTracks()[0];
                    const videoTrack = stream.getVideoTracks()[0];

                    if (audioTrack) {
                        await this.callService.produce(audioTrack, 'audio');
                    }

                    if (videoTrack) {
                        await this.callService.produce(videoTrack, 'video');
                    }

                    // Agregar peers existentes y consumir sus producers
                    console.log('[VideoCall] Peers existentes:', data.peers);
                    for (const peerData of data.peers) {
                        this.callService.addPeer(peerData.peerId);

                        // Consumir cada producer del peer existente
                        for (const producer of peerData.producers) {
                            console.log(
                                `[VideoCall] Consumiendo producer existente:`,
                                producer
                            );
                            try {
                                await this.callService.consume(
                                    socket,
                                    producer.id,
                                    producer.kind,
                                    peerData.peerId
                                );
                            } catch (error) {
                                console.error(
                                    '[VideoCall] Error consumiendo producer existente:',
                                    error
                                );
                            }
                        }
                    }

                    this.callService.setInCall(true);
                } catch (error) {
                    console.error(
                        '[VideoCall] Error configurando llamada:',
                        error
                    );
                }
            });

            // Cuando un nuevo peer se une
            socket.on('newPeerInCall', (data: { peerId: string }) => {
                console.log('[VideoCall] Nuevo peer:', data.peerId);
                this.callService.addPeer(data.peerId);
            });

            // Cuando un peer empieza a producir audio/video
            socket.on('newProducer', async (data: any) => {
                console.log('[VideoCall] Nuevo producer recibido:', {
                    peerId: data.peerId,
                    producerId: data.producerId,
                    kind: data.kind
                });

                try {
                    await this.callService.consume(
                        socket,
                        data.producerId,
                        data.kind,
                        data.peerId
                    );
                    console.log(`[VideoCall] Consume completado para ${data.kind} de peer ${data.peerId}`);
                    
                    // Verificar que el peer fue actualizado correctamente
                    const peers = this.remotePeers;
                    const peer = peers.find(p => p.id === data.peerId);
                    if (peer && peer.stream) {
                        console.log(`[VideoCall] Peer ${data.peerId} tiene stream con tracks:`, {
                            video: peer.stream.getVideoTracks().length,
                            audio: peer.stream.getAudioTracks().length
                        });
                    } else {
                        console.warn(`[VideoCall] Peer ${data.peerId} no tiene stream después de consume`);
                    }
                } catch (error) {
                    console.error('[VideoCall] Error consumiendo:', error);
                }
            });

            // Cuando un peer se va
            socket.on('peerLeftCall', (data: { peerId: string }) => {
                console.log('[VideoCall] Peer se fue:', data.peerId);
                this.callService.removePeer(data.peerId);
            });

            // Errores
            socket.on('callError', (data: any) => {
                console.error('[VideoCall] Error:', data);
                alert('Error en la llamada: ' + data.message);
            });
        };

        checkSocket();
    }

    /**
     * Unirse a la llamada
     */
    async joinCall(): Promise<void> {
        try {
            const socket = this.socketService.getSocket();

            if (!socket) {
                console.error(
                    '[VideoCall] Socket no disponible. Asegúrate de estar autenticado.'
                );
                alert(
                    'No se puede conectar. Por favor, inicia sesión primero.'
                );
                return;
            }
            console.log(this.roomId, this.group)
            socket.emit('joinCallRoom', {
                roomId: this.roomId,
                peerId: this.peerId,
                group: this.group
            });
        } catch (error) {
            console.error('[VideoCall] Error uniéndose a llamada:', error);
        }
    }

    /**
     * Salir de la llamada
     */
    leaveCall(): void {
        if (this.isInCall) {
            const socket = this.socketService.getSocket();

            if (socket) {
                socket.emit('leaveCallRoom', {
                    roomId: this.roomId,
                    peerId: this.peerId,
                });
            }

            this.callService.cleanup();
            this.modalsService.closeCall();
        }
    }

    /**
     * Toggle audio (mute/unmute)
     */
    toggleAudio(): void {
        this.isAudioEnabled = this.callService.toggleAudio();
    }

    /**
     * Toggle video (on/off)
     */
    toggleVideo(): void {
        this.isVideoEnabled = this.callService.toggleVideo();
    }
}
