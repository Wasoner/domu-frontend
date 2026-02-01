import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ProtectedLayout } from '../layout';
import { Icon, Spinner, Button } from '../components';
import { api } from '../services';
import { useAppContext } from '../context';
import './ChatHub.scss';

const ChatHub = () => {
    const { user } = useAppContext();
    const location = useLocation();
    const [rooms, setRooms] = useState([]);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'requests'
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchData = async () => {
        try {
            const [roomsData, requestsData] = await Promise.all([
                api.chat.listRooms(),
                api.chat.listRequests()
            ]);
            setRooms(roomsData || []);
            setRequests(requestsData || []);
            
            if (location.state?.roomId) {
                const room = (roomsData || []).find(r => r.id === location.state.roomId);
                if (room) setActiveRoom(room);
            }
        } catch (err) {
            console.error("Error loading chat data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const token = localStorage.getItem('authToken');
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = import.meta.env.DEV ? 'localhost:7000' : window.location.host;
        
        ws.current = new WebSocket(`${protocol}//${host}/ws/chat?token=${token}`);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_MESSAGE') {
                if (activeRoom?.id === data.roomId) {
                    setMessages(prev => [...prev, data.message]);
                }
                setRooms(prev => prev.map(r => 
                    r.id === data.roomId ? { ...r, lastMessage: data.message, lastMessageAt: new Date().toISOString() } : r
                ));
            }
        };

        return () => ws.current?.close();
    }, [activeRoom?.id]);

    useEffect(() => {
        if (activeRoom) {
            const fetchMessages = async () => {
                try {
                    const data = await api.chat.getMessages(activeRoom.id);
                    setMessages((data || []).reverse());
                } catch (err) {
                    console.error("Error loading messages", err);
                }
            };
            fetchMessages();
        }
    }, [activeRoom]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeRoom) return;

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
            console.error("Error updating request status", err);
        }
    };

    if (loading) return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge', 'staff']}>
            <div className="chat-hub-loading"><Spinner /></div>
        </ProtectedLayout>
    );

    return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge', 'staff']}>
            <div className="chat-hub">
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
                    </div>
                    
                    <div className="chat-hub__scroll-area">
                        {activeTab === 'messages' ? (
                            <div className="chat-hub__room-list">
                                {rooms.length > 0 ? rooms.map(room => {
                                    const otherParticipant = room.participants.find(p => p.id !== user.id);
                                    return (
                                        <div 
                                            key={room.id} 
                                            className={`room-item ${activeRoom?.id === room.id ? 'is-active' : ''}`}
                                            onClick={() => setActiveRoom(room)}
                                        >
                                            <div className="room-item__avatar">
                                                {otherParticipant?.name.charAt(0)}
                                            </div>
                                            <div className="room-item__info">
                                                <div className="room-item__top">
                                                    <strong>{otherParticipant?.name}</strong>
                                                    <span>{room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                </div>
                                                <p className="room-item__preview">
                                                    {room.itemTitle && <span className="item-tag">{room.itemTitle}: </span>}
                                                    {room.lastMessage?.content || 'Inicia una conversación'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="requests-empty">No tienes mensajes aún</div>
                                )}
                            </div>
                        ) : (
                            <div className="chat-hub__requests-list">
                                {requests.length > 0 ? requests.map(req => (
                                    <div key={req.id} className="request-item">
                                        <div className="request-item__avatar">{req.senderName.charAt(0)}</div>
                                        <div className="request-item__info">
                                            <strong>{req.senderName}</strong>
                                            <p>{req.initialMessage}</p>
                                            <div className="request-item__actions">
                                                <Button size="sm" variant="primary" onClick={() => handleRequestAction(req.id, 'APPROVED')}>Aceptar</Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleRequestAction(req.id, 'REJECTED')}>Rechazar</Button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="requests-empty">No hay solicitudes pendientes</div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                <main className="chat-hub__main">
                    {activeRoom ? (
                        <>
                            <header className="chat-hub__chat-header">
                                <div className="chat-header__user">
                                    <div className="chat-header__avatar">
                                        {activeRoom.participants.find(p => p.id !== user.id)?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3>{activeRoom.participants.find(p => p.id !== user.id)?.name}</h3>
                                        <span className="chat-header__status">En línea</span>
                                    </div>
                                </div>
                                {activeRoom.itemTitle && (
                                    <div className="chat-header__item">
                                        <span>Interés en: <strong>{activeRoom.itemTitle}</strong></span>
                                    </div>
                                )}
                            </header>

                            <div className="chat-hub__messages">
                                {messages.map((msg, index) => (
                                    <div key={msg.id || index} className={`message-bubble ${msg.senderId === user.id ? 'is-mine' : ''}`}>
                                        <div className="message-bubble__content">
                                            <p>{msg.content}</p>
                                            <span className="message-bubble__time">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {msg.senderId === user.id && (
                                                    <Icon name="check" size={14} className={msg.readAt ? 'is-read' : ''} />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <footer className="chat-hub__input-area">
                                <form onSubmit={handleSendMessage}>
                                    <button type="button" className="btn-icon">
                                        <Icon name="microphone" size={20} />
                                    </button>
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
        </ProtectedLayout>
    );
};

export default ChatHub;
