import PropTypes from 'prop-types';
import './InstallPrompt.css';

function InstallPrompt({ t, variant, onInstall, onDismiss }) {
  InstallPrompt.propTypes = {
    t: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(['native', 'ios']),
    onInstall: PropTypes.func,
    onDismiss: PropTypes.func.isRequired,
  };
  InstallPrompt.defaultProps = {
    variant: 'native',
  };

  const isIos = variant === 'ios';

  return (
    <div className="install-prompt" role="dialog" aria-label={t('installApp')}>
      <span className="install-prompt-icon" aria-hidden="true">
        {isIos ? '⬆️' : '📲'}
      </span>
      <div className="install-prompt-body">
        <p className="install-prompt-title">{t('installApp')}</p>
        <p className="install-prompt-description">{t(isIos ? 'installAppIosDescription' : 'installAppDescription')}</p>
      </div>
      <div className="install-prompt-actions">
        <button className="install-prompt-dismiss" onClick={onDismiss}>
          {t('notNow')}
        </button>
        {!isIos && (
          <button className="install-prompt-install" onClick={onInstall}>
            {t('install')}
          </button>
        )}
      </div>
    </div>
  );
}

export default InstallPrompt;
