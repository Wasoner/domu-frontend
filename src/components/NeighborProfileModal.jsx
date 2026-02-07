import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Icon, Button, Skeleton } from './index';
import { api } from '../services';
import { ROUTES } from '../constants';
import './NeighborProfileModal.scss';

const NeighborProfileModal = ({ userId, onClose, onContact }) => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestMessage, setRequestMessage] = useState('');
    const [sendingRequest, setSendingRequest] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.users.getProfile(userId);
                setProfile(data);
            } catch (err) {
                console.error("Error fetching profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    const handleSendRequest = async () => {
        setSendingRequest(true);
        try {
            await api.chat.sendRequest({
                receiverId: userId,
                message: requestMessage
            });
            setRequestSent(true);
        } catch (err) {
            console.error("Error sending chat request", err);
        } finally {
            setSendingRequest(false);
        }
    };

    const handleGoToChat = () => {
        navigate(ROUTES.RESIDENT_CHAT, { state: { roomId: profile.activeChatRoomId } });
        onClose();
    };

    if (loading) return (
        <div className="neighbor-modal-overlay">
            <div className="neighbor-modal neighbor-modal--loading">
                <Skeleton.Profile />
            </div>
        </div>
    );

    if (!profile) return null;

    return (
        <div className="neighbor-modal-overlay" onClick={onClose}>
            <div className="neighbor-modal" onClick={e => e.stopPropagation()}>
                <button className="neighbor-modal__close" onClick={onClose}>
                    <Icon name="xMark" size={24} />
                </button>

                <div className="neighbor-modal__header">
                    <div className="neighbor-modal__avatar">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={profile.firstName} />
                        ) : (
                            <span>{profile.firstName.charAt(0)}</span>
                        )}
                    </div>
                    <h2>{profile.firstName} {profile.lastName}</h2>
                    <p className="neighbor-modal__unit">{profile.unitIdentifier}</p>
                </div>

                <div className="neighbor-modal__content">
                    <div className="neighbor-modal__section">
                        <h3>Sobre mí</h3>
                        <p>{profile.bio || "Este vecino aún no ha agregado una descripción."}</p>
                    </div>

                    {profile.itemsForSale.length > 0 && (
                        <div className="neighbor-modal__section">
                            <h3>En venta</h3>
                            <div className="neighbor-modal__items-grid">
                                {profile.itemsForSale.map(item => (
                                    <div key={item.id} className="neighbor-modal__item">
                                        <img src={item.mainImageUrl} alt={item.title} />
                                        <span>${new Intl.NumberFormat('es-CL').format(item.price)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="neighbor-modal__action-box">
                        {profile.activeChatRoomId ? (
                            <Button 
                                variant="secondary" 
                                fullWidth 
                                onClick={handleGoToChat}
                                icon={<Icon name="chatBubbleLeftRight" size={18} />}
                            >
                                Ir al chat existente
                            </Button>
                        ) : requestSent ? (
                            <div className="neighbor-modal__success">
                                <Icon name="check" size={20} />
                                <span>¡Solicitud enviada! Espera a que acepte para chatear.</span>
                            </div>
                        ) : (
                            <>
                                <textarea 
                                    placeholder="Escribe un mensaje para iniciar el chat..."
                                    value={requestMessage}
                                    onChange={(e) => setRequestMessage(e.target.value)}
                                />
                                <Button 
                                    variant="primary" 
                                    fullWidth 
                                    onClick={handleSendRequest}
                                    disabled={sendingRequest || !requestMessage.trim()}
                                >
                                    {sendingRequest ? "Enviando..." : "Solicitar Chat"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

NeighborProfileModal.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onClose: PropTypes.func.isRequired,
    onContact: PropTypes.func,
};

export default NeighborProfileModal;
