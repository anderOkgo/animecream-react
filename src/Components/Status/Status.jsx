import PropTypes from 'prop-types';

function Status({ init, proc }) {
  Status.propTypes = {
    init: PropTypes.any,
    proc: PropTypes.any,
  };
  return (
    <>
      {proc && <span> &#9201;</span>} {init ? <span> &#128293;&nbsp;</span> : <span> &#10060;</span>}
    </>
  );
}

export default Status;
