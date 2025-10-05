import PropTypes from 'prop-types';

function Status({ init, proc }) {
  Status.propTypes = {
    init: PropTypes.any,
    proc: PropTypes.any,
  };
  return (
    <>
      {proc && <span className="status-box">&#9201;</span>}
      {init ? <span className="status-box">&#128293;</span> : <span className="status-box">&#10060;</span>}
    </>
  );
}

export default Status;
