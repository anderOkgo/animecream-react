import * as React from 'react';
import './CardRow.css';

export default function CardRow({ el, t, language }) {
  let {
    production_name,
    production_year,
    production_description,
    production_description_en,
    production_ranking_number,
    production_image_path,
    genre_names,
    demographic_name,
    production_number_chapters,
  } = el;

  // Seleccionar la descripción según el idioma
  const description =
    language === 'en' && production_description_en ? production_description_en : production_description;

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
          {t('info')}
        </label>
        <div className="panel">
          <div id="section1" className="tab-section">
            <div className="section-content">
              <img
                fetchpriority="high"
                width="140"
                height="210"
                src={`.${production_image_path}`}
                alt="Image"
                className="img-card"
              />
              <div className="section-details">
                <h2>{`#${production_ranking_number}. ${production_name}`}</h2>
                <hr />
                <p className="production-desc">{description}</p>
                <div className="tags">
                  <span className="tag year">{`${production_year}`}</span>
                  <span className="tag ep">{`${production_number_chapters} Ep`}</span>
                  <span className="tag">{demographic_name}</span>
                  {genre_names.split(',').map((genre) => (
                    <span className="tag" key={genre} variant="text">
                      {t(genre)}
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
          {t('cardDescription')}
        </label>
        <div className="panel">
          <div id="section2" className="tab-section">
            <h2>{production_name}</h2>
            <br />
            <p>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
