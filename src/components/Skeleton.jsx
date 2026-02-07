import PropTypes from 'prop-types';
import './Skeleton.scss';

/**
 * Skeleton – placeholder shimmer while content loads.
 *
 * Variants:
 *  - text   → single-line text placeholder (default)
 *  - title  → wider, taller line (for headings)
 *  - circle → avatar / icon placeholder
 *  - rect   → generic rectangular block
 *  - card   → full card placeholder with image + lines
 *  - button → button-shaped placeholder (inline)
 *
 * You can also compose custom skeletons by nesting multiple
 * <Skeleton /> elements inside a wrapper.
 */
function Skeleton({
  variant = 'text',
  width,
  height,
  borderRadius,
  count = 1,
  gap = '0.5rem',
  className = '',
  style: externalStyle = {},
}) {
  const base = `skeleton skeleton--${variant}`;
  const mergedStyle = { ...externalStyle };
  if (width) mergedStyle.width = width;
  if (height) mergedStyle.height = height;
  if (borderRadius) mergedStyle.borderRadius = borderRadius;

  if (count > 1) {
    return (
      <div className={`skeleton-group ${className}`} style={{ display: 'flex', flexDirection: 'column', gap }}>
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={base}
            style={{
              ...mergedStyle,
              // vary last line width for a more natural look
              ...(variant === 'text' && i === count - 1 ? { width: width || '60%' } : {}),
            }}
          />
        ))}
      </div>
    );
  }

  return <span className={`${base} ${className}`} style={mergedStyle} />;
}

/* ── Pre-composed skeletons for common patterns ── */

/** Skeleton for a list of rows (e.g. table, parcels, staff list) */
Skeleton.List = function SkeletonList({ rows = 3, className = '' }) {
  return (
    <div className={`skeleton-list ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-list__row">
          <Skeleton variant="circle" width="36px" height="36px" />
          <div className="skeleton-list__text">
            <Skeleton variant="text" width="45%" />
            <Skeleton variant="text" width="70%" />
          </div>
          <Skeleton variant="rect" width="64px" height="24px" borderRadius="var(--radius-sm, 6px)" />
        </div>
      ))}
    </div>
  );
};

/** Skeleton for a card grid (e.g. marketplace, amenities) */
Skeleton.Cards = function SkeletonCards({ count = 3, className = '' }) {
  return (
    <div className={`skeleton-cards ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <Skeleton variant="rect" height="120px" />
          <div className="skeleton-card__body">
            <Skeleton variant="title" width="60%" />
            <Skeleton variant="text" count={2} />
          </div>
        </div>
      ))}
    </div>
  );
};

/** Skeleton for a form (e.g. create user, invite register) */
Skeleton.Form = function SkeletonForm({ fields = 4, className = '' }) {
  return (
    <div className={`skeleton-form ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="skeleton-form__field">
          <Skeleton variant="text" width="30%" height="12px" />
          <Skeleton variant="rect" height="38px" borderRadius="var(--radius-sm, 6px)" />
        </div>
      ))}
      <Skeleton variant="button" width="140px" />
    </div>
  );
};

/** Skeleton for a chat sidebar */
Skeleton.ChatList = function SkeletonChatList({ rows = 5, className = '' }) {
  return (
    <div className={`skeleton-chat-list ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-chat-list__row">
          <Skeleton variant="circle" width="44px" height="44px" />
          <div className="skeleton-chat-list__text">
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="80%" height="10px" />
          </div>
          <Skeleton variant="text" width="32px" height="10px" />
        </div>
      ))}
    </div>
  );
};

/** Skeleton for a profile modal */
Skeleton.Profile = function SkeletonProfile({ className = '' }) {
  return (
    <div className={`skeleton-profile ${className}`}>
      <Skeleton variant="circle" width="72px" height="72px" />
      <Skeleton variant="title" width="50%" />
      <Skeleton variant="text" width="30%" />
      <div className="skeleton-profile__section">
        <Skeleton variant="text" count={3} />
      </div>
    </div>
  );
};

/** Skeleton for a dashboard / stats section */
Skeleton.Stats = function SkeletonStats({ count = 3, className = '' }) {
  return (
    <div className={`skeleton-stats ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-stats__item">
          <Skeleton variant="text" width="40%" height="12px" />
          <Skeleton variant="title" width="60%" />
        </div>
      ))}
    </div>
  );
};

/** Inline skeleton for button loading state (replaces Spinner inline) */
Skeleton.Inline = function SkeletonInline({ width = '80px', label, className = '' }) {
  return (
    <span className={`skeleton-inline ${className}`}>
      <span className="skeleton skeleton--button" style={{ width, height: '18px' }} />
      {label && <span className="skeleton-inline__label">{label}</span>}
    </span>
  );
};

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'title', 'circle', 'rect', 'card', 'button']),
  width: PropTypes.string,
  height: PropTypes.string,
  borderRadius: PropTypes.string,
  count: PropTypes.number,
  gap: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Skeleton;
