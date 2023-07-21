import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import './CardRow.css';

export default function CardRow({ el }) {
  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  let {
    production_name,
    production_year,
    production_description,
    production_ranking_number,
    production_image_path,
    genre_names,
    demographic_name,
    production_number_chapters,
  } = el;

  return (
    <div className="card">
      <div className="tabs">
        <input
          className="radiotab"
          name={`tab-${production_ranking_number}`}
          tabIndex={production_ranking_number}
          type="radio"
          id={`tabone-${production_ranking_number}`}
          defaultChecked="checked"
        />
        <label className="label" htmlFor={`tabone-${production_ranking_number}`}>
          Info
        </label>
        <div className="panel" tabIndex={production_ranking_number}>
          <div id="section1" className="tab-section">
            <div className="section-content">
              <img src={`https://www.animecream.com${production_image_path}`} alt="Image" className="img-card" />
              <div className="section-details">
                <h2>{production_name}</h2>
                <p className="status">{production_description}</p>
                <div className="tags">
                  <span className="tag">{`${production_number_chapters} episodes`}</span>
                  <span className="tag">{demographic_name}</span>
                  {genre_names.split(',').map((genre) => (
                    <span className="tag" key={genre} variant="text">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <input
          className="radiotab"
          tabIndex={production_ranking_number}
          name={`tab-${production_ranking_number}`}
          type="radio"
          id={`tabtwo-${production_ranking_number}`}
        />
        <label className="label tabtow" htmlFor={`tabtwo-${production_ranking_number}`}>
          Description
        </label>
        <div className="panel" tabIndex={production_ranking_number}>
          <div id="section2" className="tab-section">
            <h2>{production_name}</h2>
            <p>{production_description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
