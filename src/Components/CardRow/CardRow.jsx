import * as React from 'react';
import './CardRow.css';

export default function CardRow({ el }) {
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
          type="radio"
          id={`tabone-${production_ranking_number}`}
          defaultChecked="checked"
        />
        <label className="label" htmlFor={`tabone-${production_ranking_number}`}>
          Info
        </label>
        <div className="panel">
          <div id="section1" className="tab-section">
            <div className="section-content">
              <img
                width="140"
                height="210"
                src={`https://www.animecream.com${production_image_path}`}
                alt="Image"
                className="img-card"
              />
              <div className="section-details">
                <h2>{`#${production_ranking_number}. ${production_name}`}</h2>
                <hr />
                <p className="production-desc">{production_description}</p>
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
          name={`tab-${production_ranking_number}`}
          type="radio"
          id={`tabtwo-${production_ranking_number}`}
        />
        <label className="label tab-desc" htmlFor={`tabtwo-${production_ranking_number}`}>
          Description
        </label>
        <div className="panel">
          <div id="section2" className="tab-section">
            <h2>{production_name}</h2>
            <br />
            <p>{production_description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
