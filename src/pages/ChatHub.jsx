import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ProtectedLayout } from '../layout';
import { Icon, Skeleton, Button } from '../components';
import { api } from '../services';
import { useAppContext } from '../context';
import './ChatHub.scss';

const ChatHub = () => {
    const { user } = useAppContext();
    const location = useLocation();
    const [rooms, setRooms] = useState([]);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('messages');
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [neighbors, setNeighbors] = useState([]);
    const [neighborSearch, setNeighborSearch] = useState('');
    const [sendingRequest, setSendingRequest] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [mobileView, setMobileView] = useState('sidebar'); // 'sidebar' | 'chat'
    const [roomToDelete, setRoomToDelete] = useState(null);

    const ws = useRef(null);
    const messagesContainerRef = useRef(null);
    const activeRoomRef = useRef(null);
    const isRoomChangeRef = useRef(false);

    // Keep ref in sync so WS callback always sees latest value
    useEffect(() => {
        activeRoomRef.current = activeRoom;
    }, [activeRoom]);

    const scrollToBottom = useCallback((instant = false) => {
        const container = messagesContainerRef.current;
        if (!container) return;
        if (instant) {
            container.scrollTop = container.scrollHeight;
        } else {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
    }, []);

    // Scroll after messages render — instant on room change, smooth on new message
    useLayoutEffect(() => {
        if (messages.length === 0) return;
        const instant = isRoomChangeRef.current;
        isRoomChangeRef.current = false;
        // rAF ensures the DOM has been laid out with the new messages
        requestAnimationFrame(() => scrollToBottom(instant));
    }, [messages, scrollToBottom]);

    const fetchData = useCallback(async () => {
        try {
            const [roomsData, requestsData, onlineData] = await Promise.all([
                api.chat.listRooms(),
                api.chat.listRequests(),
                api.chat.getOnlineUsers().catch(() => []),
            ]);
            setRooms(roomsData || []);
            setRequests(requestsData || []);
            setOnlineUsers(new Set(onlineData || []));

            if (location.state?.roomId) {
                const room = (roomsData || []).find(r => r.id === location.state.roomId);
                if (room) {
                    isRoomChangeRef.current = true;
                    setActiveRoom(room);
                    setMobileView('chat');
                }
            }
        } catch (err) {
            console.error('Error loading chat data', err);
        } finally {
            setLoading(false);
        }
    }, [location.state?.roomId]);

    // WebSocket connection — runs ONCE, not on every room change
    useEffect(() => {
        fetchData();

        const token = localStorage.getItem('authToken');
        if (!token) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = import.meta.env.DEV ? 'localhost:8080' : window.location.host;

        const connectWs = () => {
            const socket = new WebSocket(`${protocol}//${host}/ws/chat?token=${token}`);

            socket.onopen = () => {
                console.log('[Chat WS] Connected');
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'NEW_MESSAGE') {
                        const current = activeRoomRef.current;
                        if (current?.id === data.roomId) {
                            setMessages(prev => [...prev, data.message]);
                        }
                        setRooms(prev => prev.map(r =>
                            r.id === data.roomId
                                ? { ...r, lastMessage: data.message, lastMessageAt: new Date().toISOString() }
                                : r
                        ));
                    } else if (data.type === 'PRESENCE') {
                        setOnlineUsers(prev => {
                            const next = new Set(prev);
                            if (data.online) {
                                next.add(data.userId);
                            } else {
                                next.delete(data.userId);
                            }
                            return next;
                        });
                    }
                } catch (e) {
                    console.error('[Chat WS] Parse error', e);
                }
            };

            socket.onclose = () => {
                console.log('[Chat WS] Disconnected, reconnecting in 3s...');
                setTimeout(() => {
                    if (ws.current === socket) {
                        ws.current = null;
                        connectWs();
                    }
                }, 3000);
            };

            socket.onerror = () => {
                socket.close();
            };

            ws.current = socket;
        };

        connectWs();

        return () => {
            const socket = ws.current;
            ws.current = null;
            socket?.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch messages when active room changes
    useEffect(() => {
        if (!activeRoom) return;
        const fetchMessages = async () => {
            try {
                isRoomChangeRef.current = true;
                const data = await api.chat.getMessages(activeRoom.id);
                setMessages((data || []).reverse());
            } catch (err) {
                console.error('Error loading messages', err);
            }
        };
        fetchMessages();
    }, [activeRoom]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeRoom || !ws.current) return;

        ws.current.send(JSON.stringify({
            type: 'SEND_MSG',
            roomId: activeRoom.id,
            content: newMessage,
            msgType: 'TEXT'
        }));
        setNewMessage('');
    };

    const handleRequestAction = async (requestId, status) => {
        try {
            await api.chat.updateRequestStatus(requestId, status);
            fetchData();
        } catch (err) {
            console.error('Error updating request status', err);
        }
    };

    const openNewChatModal = async () => {
        setIsNewChatModalOpen(true);
        try {
            const data = await api.chat.listNeighbors();
            setNeighbors(data || []);
        } catch (err) {
            console.error('Error fetching neighbors', err);
        }
    };

    const handleSendInitialRequest = async (neighborId) => {
        try {
            setSendingRequest(true);
            await api.chat.sendRequest({
                receiverId: neighborId,
                initialMessage: 'Hola, me gustaría chatear contigo.'
            });
            setIsNewChatModalOpen(false);
            fetchData();
            setActiveTab('requests');
        } catch (err) {
            console.error('Error sending chat request', err);
        } finally {
            setSendingRequest(false);
        }
    };

    const handleSelectRoom = (room) => {
        setActiveRoom(room);
        setMobileView('chat');
    };

    const handleBackToSidebar = () => {
        setMobileView('sidebar');
    };

    const handleHideRoom = async (roomId) => {
        try {
            await api.chat.hideRoom(roomId);
            setRooms((prev) => prev.filter((r) => r.id !== roomId));
            if (activeRoom?.id === roomId) {
                setActiveRoom(null);
                setMessages([]);
                setMobileView('sidebar');
            }
        } catch (err) {
            console.error('Error hiding room', err);
        } finally {
            setRoomToDelete(null);
        }
    };

    const filteredNeighbors = neighbors.filter(n => {
        const q = neighborSearch.toLowerCase();
        return (n.unitNumber?.toLowerCase().includes(q) ||
                n.displayName?.toLowerCase().includes(q));
    });

    const getOtherParticipant = (room) => {
        return room?.participants?.find(p => p.id !== user?.id);
    };

    const isUserOnline = (userId) => onlineUsers.has(userId);

    if (loading) return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge', 'staff']}>
            <div className="chat-hub" style={{ display: 'flex', height: '100%' }}>
                <aside className="chat-hub__sidebar" style={{ padding: '1rem' }}>
                    <Skeleton.ChatList rows={6} />
                </aside>
                <main className="chat-hub__main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem' }}>
                    <Skeleton variant="circle" width="64px" height="64px" />
                    <Skeleton variant="title" width="200px" />
                    <Skeleton variant="text" width="280px" />
                </main>
            </div>
        </ProtectedLayout>
    );

    return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge', 'staff']}>
            <div className={`chat-hub ${mobileView === 'chat' && activeRoom ? 'chat-hub--chat-open' : ''}`}>
                {/* ── Sidebar ── */}
                <aside className="chat-hub__sidebar">
                    <div className="chat-hub__sidebar-header">
                        <div className="chat-tabs">
                            <button
                                className={activeTab === 'messages' ? 'is-active' : ''}
                                onClick={() => setActiveTab('messages')}
                            >
                                Mensajes
                            </button>
                            <button
                                className={activeTab === 'requests' ? 'is-active' : ''}
                                onClick={() => setActiveTab('requests')}
                            >
                                Solicitudes {requests.length > 0 && <span className="badge">{requests.length}</span>}
                            </button>
                        </div>
                        <button className="btn-new-chat" onClick={openNewChatModal} title="Nuevo Chat">
                            <Icon name="plus" size={20} />
                        </button>
                    </div>

                    <div className="chat-hub__scroll-area">
                        {activeTab === 'messages' ? (
                            <div className="chat-hub__room-list">
                                {rooms.length > 0 ? rooms.map(room => {
                                    const other = getOtherParticipant(room);
                                    const online = other ? isUserOnline(other.id) : false;
                                    return (
                                        <div
                                            key={room.id}
                                            className={`room-item ${activeRoom?.id === room.id ? 'is-active' : ''}`}
                                            onClick={() => handleSelectRoom(room)}
                                        >
                                            <div className="room-item__avatar">
                                                {other?.photoUrl ? (
                                                    <img src={other.photoUrl} alt="" />
                                                ) : (
                                                    other?.name?.charAt(0) || '?'
                                                )}
                                                <span className={`presence-dot ${online ? 'is-online' : ''}`} />
                                            </div>
                                            <div className="room-item__info">
                                                <div className="room-item__top">
                                                    <strong>{other?.name || 'Vecino'}</strong>
                                                    <span>{room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                </div>
                                                <p className="room-item__preview">
                                                    {room.itemTitle && <span className="item-tag">{room.itemTitle}: </span>}
                                                    {room.lastMessage?.content || 'Inicia una conversación'}
                                                </p>
                                            </div>
                                            <button
                                                className="room-item__delete"
                                                onClick={(e) => { e.stopPropagation(); setRoomToDelete(room); }}
                                                aria-label="Eliminar conversación"
                                                title="Eliminar conversación"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                }) : (
                                    <div className="requests-empty">
                                        <Icon name="chatBubbleLeftRight" size={32} />
                                        <p>No tienes mensajes aún</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="chat-hub__requests-list">
                                {requests.length > 0 ? requests.map(req => (
                                    <div key={req.id} className="request-item">
                                        <div className="request-item__avatar">
                                            {req.senderName?.charAt(0) || '?'}
                                        </div>
                                        <div className="request-item__info">
                                            <strong>Unidad {req.senderUnitNumber || '—'}</strong>
                                            <p>{req.initialMessage}</p>
                                            <div className="request-item__actions">
                                                <Button size="sm" variant="primary" onClick={() => handleRequestAction(req.id, 'APPROVED')}>Aceptar</Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleRequestAction(req.id, 'REJECTED')}>Rechazar</Button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="requests-empty">
                                        <Icon name="chatBubbleLeftRight" size={32} />
                                        <p>No hay solicitudes pendientes</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── Main Chat Area ── */}
                <main className="chat-hub__main">
                    {activeRoom ? (
                        <>
                            <header className="chat-hub__chat-header">
                                <div className="chat-header__left">
                                    <button className="chat-header__back" onClick={handleBackToSidebar} aria-label="Volver">
                                        <Icon name="arrowLeft" size={20} />
                                    </button>
                                    <div className="chat-header__avatar">
                                        {getOtherParticipant(activeRoom)?.photoUrl ? (
                                            <img src={getOtherParticipant(activeRoom).photoUrl} alt="" />
                                        ) : (
                                            getOtherParticipant(activeRoom)?.name?.charAt(0) || '?'
                                        )}
                                        <span className={`presence-dot ${isUserOnline(getOtherParticipant(activeRoom)?.id) ? 'is-online' : ''}`} />
                                    </div>
                                    <div className="chat-header__user-info">
                                        <h3>{getOtherParticipant(activeRoom)?.name || 'Vecino'}</h3>
                                        <span className={`chat-header__status ${isUserOnline(getOtherParticipant(activeRoom)?.id) ? 'is-online' : ''}`}>
                                            {isUserOnline(getOtherParticipant(activeRoom)?.id) ? 'En línea' : 'Desconectado'}
                                        </span>
                                    </div>
                                </div>
                                {activeRoom.itemTitle && (
                                    <div className="chat-header__item">
                                        <span>Interés en: <strong>{activeRoom.itemTitle}</strong></span>
                                    </div>
                                )}
                            </header>

                            <div className="chat-hub__messages" ref={messagesContainerRef}>
                                {messages.length === 0 && (
                                    <div className="chat-hub__messages-empty">
                                        <p>No hay mensajes aún. ¡Envía el primero!</p>
                                    </div>
                                )}
                                {messages.map((msg, index) => (
                                    <div key={msg.id || index} className={`message-bubble ${msg.senderId === user?.id ? 'is-mine' : ''}`}>
                                        <div className="message-bubble__content">
                                            <p>{msg.content}</p>
                                            <span className="message-bubble__time">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {msg.senderId === user?.id && (
                                                    <Icon name="check" size={14} className={msg.readAt ? 'is-read' : ''} />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <footer className="chat-hub__input-area">
                                <form onSubmit={handleSendMessage}>
                                    <input
                                        type="text"
                                        placeholder="Escribe un mensaje..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit" className="btn-send" disabled={!newMessage.trim()}>
                                        <Icon name="arrowRight" size={20} />
                                    </button>
                                </form>
                            </footer>
                        </>
                    ) : (
                        <div className="chat-hub__empty-state">
                            <Icon name="chatBubbleLeftRight" size={64} />
                            <h2>Selecciona una conversación</h2>
                            <p>Habla con tus vecinos sobre productos o servicios de la comunidad.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* ── Delete Confirmation Modal ── */}
            {roomToDelete && (
                <div className="chat-modal-overlay" onClick={() => setRoomToDelete(null)}>
                    <div className="chat-modal chat-modal--sm" onClick={(e) => e.stopPropagation()}>
                        <header className="chat-modal__header">
                            <h3>Eliminar conversación</h3>
                            <button onClick={() => setRoomToDelete(null)} aria-label="Cerrar">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </header>
                        <div className="chat-modal__body">
                            <p>Esta conversación desaparecerá de tu lista. Si te envían un nuevo mensaje, volverá a aparecer.</p>
                        </div>
                        <div className="chat-modal__actions">
                            <Button size="sm" variant="ghost" onClick={() => setRoomToDelete(null)}>Cancelar</Button>
                            <Button size="sm" variant="danger" onClick={() => handleHideRoom(roomToDelete.id)}>Eliminar</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── New Chat Modal ── */}
            {isNewChatModalOpen && (
                <div className="chat-modal-overlay" onClick={() => setIsNewChatModalOpen(false)}>
                    <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
                        <header className="chat-modal__header">
                            <h3>Nuevo Chat</h3>
                            <button onClick={() => setIsNewChatModalOpen(false)} aria-label="Cerrar">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </header>
                        <div className="chat-modal__search">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o unidad..."
                                value={neighborSearch}
                                onChange={(e) => setNeighborSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="chat-modal__list">
                            {filteredNeighbors.length > 0 ? filteredNeighbors.map(n => (
                                <div key={n.id} className="neighbor-item">
                                    <div className="neighbor-item__avatar">
                                        {n.avatarUrl ? (
                                            <img src={n.avatarUrl} alt="" />
                                        ) : (
                                            <Icon name="user" size={24} />
                                        )}
                                        <span className={`presence-dot ${isUserOnline(n.id) ? 'is-online' : ''}`} />
                                    </div>
                                    <div className="neighbor-item__info">
                                        <strong>{n.displayName || `Unidad ${n.unitNumber}`}</strong>
                                        <span>Unidad {n.unitNumber} {isUserOnline(n.id) ? '· En línea' : ''}</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleSendInitialRequest(n.id)}
                                        disabled={sendingRequest}
                                    >
                                        {sendingRequest ? '...' : 'Solicitar'}
                                    </Button>
                                </div>
                            )) : (
                                <p className="no-results">No se encontraron vecinos disponibles para chat.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ProtectedLayout>
    );
};

export default ChatHub;
