import PropTypes from 'prop-types';
import './CreditCardSVG.scss';

const CreditCardSVG = ({
  cardNumber = '',
  cardHolder = '',
  expiryDate = '',
  cvv = '',
  isFlipped = false,
}) => {
  const formatCardNumber = (num) => {
    const cleaned = num.replace(/\s/g, '');
    const groups = [];
    for (let i = 0; i < 16; i += 4) {
      const group = cleaned.slice(i, i + 4);
      groups.push(group.padEnd(4, '#').split('').map((c, idx) => {
        if (c === '#') return '#';
        if (i + idx < cleaned.length) return cleaned[i + idx];
        return '#';
      }).join(''));
    }
    return groups.join(' ');
  };

  const getCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'default';
  };

  const cardType = getCardType(cardNumber);
  const displayNumber = formatCardNumber(cardNumber);
  const displayHolder = cardHolder || 'NOMBRE APELLIDO';
  const displayExpiry = expiryDate || 'MM/YY';
  const displayCvv = cvv ? cvv.replace(/./g, '*') : '***';

  return (
    <div className="credit-card-svg">
      <div className={`credit-card-svg__card ${isFlipped ? 'credit-card-svg__card--flipped' : ''}`}>
        {/* Front */}
        <div className="credit-card-svg__front">
          <svg viewBox="0 0 340 215" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a5f" />
                <stop offset="50%" stopColor="#0f2744" />
                <stop offset="100%" stopColor="#0d1b2a" />
              </linearGradient>
              <linearGradient id="chipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="100%" stopColor="#b8860b" />
              </linearGradient>
            </defs>

            {/* Card Background */}
            <rect x="0" y="0" width="340" height="215" rx="15" fill="url(#cardGradient)" />

            {/* Decorative circles */}
            <circle cx="300" cy="30" r="80" fill="rgba(255,255,255,0.03)" />
            <circle cx="320" cy="180" r="100" fill="rgba(255,255,255,0.02)" />

            {/* Chip */}
            <rect x="30" y="70" width="50" height="40" rx="5" fill="url(#chipGradient)" />
            <line x1="30" y1="80" x2="80" y2="80" stroke="#b8860b" strokeWidth="2" />
            <line x1="30" y1="90" x2="80" y2="90" stroke="#b8860b" strokeWidth="2" />
            <line x1="30" y1="100" x2="80" y2="100" stroke="#b8860b" strokeWidth="2" />
            <line x1="55" y1="70" x2="55" y2="110" stroke="#b8860b" strokeWidth="2" />

            {/* Contactless icon */}
            <g transform="translate(95, 75)" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
              <path d="M0 15 Q 5 10, 10 15 Q 15 20, 20 15" />
              <path d="M3 10 Q 8 5, 13 10 Q 18 15, 23 10" />
              <path d="M6 5 Q 11 0, 16 5 Q 21 10, 26 5" />
            </g>

            {/* Card Number */}
            <text
              x="30"
              y="145"
              fill="rgba(255,255,255,0.9)"
              fontFamily="'Courier New', monospace"
              fontSize="22"
              letterSpacing="2"
            >
              {displayNumber}
            </text>

            {/* Card Holder Label */}
            <text x="30" y="175" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Arial, sans-serif">
              TITULAR DE LA TARJETA
            </text>

            {/* Card Holder Name */}
            <text
              x="30"
              y="192"
              fill="rgba(255,255,255,0.9)"
              fontSize="14"
              fontFamily="Arial, sans-serif"
              fontWeight="500"
            >
              {displayHolder.toUpperCase().slice(0, 25)}
            </text>

            {/* Expiry Label */}
            <text x="220" y="175" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Arial, sans-serif">
              VALIDO HASTA
            </text>

            {/* Expiry Date */}
            <text
              x="220"
              y="192"
              fill="rgba(255,255,255,0.9)"
              fontSize="14"
              fontFamily="'Courier New', monospace"
              fontWeight="500"
            >
              {displayExpiry}
            </text>

            {/* Card Brand Logo */}
            {cardType === 'visa' && (
              <text x="270" y="45" fill="#fff" fontSize="24" fontFamily="Arial, sans-serif" fontWeight="bold" fontStyle="italic">
                VISA
              </text>
            )}
            {cardType === 'mastercard' && (
              <g transform="translate(260, 20)">
                <circle cx="20" cy="20" r="18" fill="#eb001b" />
                <circle cx="40" cy="20" r="18" fill="#f79e1b" />
                <rect x="22" y="8" width="16" height="24" fill="#ff5f00" />
              </g>
            )}
            {cardType === 'amex' && (
              <text x="250" y="45" fill="#fff" fontSize="16" fontFamily="Arial, sans-serif" fontWeight="bold">
                AMEX
              </text>
            )}
            {cardType === 'default' && (
              <rect x="280" y="20" width="40" height="30" rx="3" fill="rgba(255,255,255,0.1)" />
            )}
          </svg>
        </div>

        {/* Back */}
        <div className="credit-card-svg__back">
          <svg viewBox="0 0 340 215" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cardGradientBack" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a5f" />
                <stop offset="50%" stopColor="#0f2744" />
                <stop offset="100%" stopColor="#0d1b2a" />
              </linearGradient>
            </defs>

            {/* Card Background */}
            <rect x="0" y="0" width="340" height="215" rx="15" fill="url(#cardGradientBack)" />

            {/* Magnetic Strip */}
            <rect x="0" y="30" width="340" height="45" fill="#1a1a1a" />

            {/* Signature Strip */}
            <rect x="20" y="100" width="200" height="40" rx="3" fill="#f5f5f5" />
            <line x1="25" y1="110" x2="215" y2="110" stroke="#ddd" strokeWidth="1" />
            <line x1="25" y1="120" x2="215" y2="120" stroke="#ddd" strokeWidth="1" />
            <line x1="25" y1="130" x2="215" y2="130" stroke="#ddd" strokeWidth="1" />

            {/* CVV Box */}
            <rect x="230" y="100" width="80" height="40" rx="3" fill="#fff" />
            <text x="245" y="90" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Arial, sans-serif">
              CVV
            </text>
            <text
              x="270"
              y="128"
              fill="#333"
              fontSize="18"
              fontFamily="'Courier New', monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {displayCvv}
            </text>

            {/* Info text */}
            <text x="20" y="175" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="Arial, sans-serif">
              Esta tarjeta es propiedad del banco emisor.
            </text>
            <text x="20" y="185" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="Arial, sans-serif">
              En caso de encontrarla, devuelvala a cualquier sucursal.
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};

CreditCardSVG.propTypes = {
  cardNumber: PropTypes.string,
  cardHolder: PropTypes.string,
  expiryDate: PropTypes.string,
  cvv: PropTypes.string,
  isFlipped: PropTypes.bool,
};

export default CreditCardSVG;
