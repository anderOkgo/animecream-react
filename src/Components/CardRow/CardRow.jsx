import * as React from 'react';
import './CardRow.css';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

export default function CardRow({ el, t, language, realNumber = null, onFilterChange, onDelete, role, onEdit }) {
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

  // Use real number if provided, otherwise use the original ranking number
  const displayNumber = realNumber !== null ? realNumber : production_ranking_number;

  // Seleccionar la descripción según el idioma
  const description =
    language === 'en' && production_description_en ? production_description_en : production_description;

  // Text-to-speech functionality
  const { isSpeaking, toggle } = useTextToSpeech();

  // Determine the language for speech synthesis
  const speechLanguage = language === 'en' ? 'en-US' : 'es-ES';

  // Filter handlers
  const handleYearClick = (e) => {
    e.stopPropagation();
    if (onFilterChange && production_year) {
      onFilterChange({
        method: 'POST',
        body: {
          production_year: production_year.toString(),
          production_ranking_number: 'ASC',
        },
      });
    }
  };

  const handleEpisodesClick = (e) => {
    e.stopPropagation();
    if (onFilterChange && production_number_chapters) {
      onFilterChange({
        method: 'POST',
        body: {
          production_number_chapters: production_number_chapters.toString(),
          production_ranking_number: 'ASC',
        },
      });
    }
  };

  const handleDemographicClick = (e) => {
    e.stopPropagation();
    if (onFilterChange && demographic_name) {
      // Map demographic names to slugs (based on SearchMethod options)
      const demographicMap = {
        Kodomo: 'kodomo',
        Shōnen: 'shonen',
        Shonen: 'shonen',
        Shounen: 'shonen',
        Shōjo: 'shojo',
        Shojo: 'shojo',
        Seinen: 'seinen',
        Josei: 'josei',
        'Shōnen-Seinen': 'shonen-seinen',
        'Shonen-Seinen': 'shonen-seinen',
        'Shounen-Seinen': 'shonen-seinen',
      };
      const slug = demographicMap[demographic_name] || demographic_name.toLowerCase().replace(/\s+/g, '-');
      onFilterChange({
        method: 'POST',
        body: {
          demographic_name: slug,
          production_ranking_number: 'ASC',
        },
      });
    }
  };

  const handleGenreClick = (e, genreName) => {
    e.stopPropagation();
    if (onFilterChange && genreName) {
      onFilterChange({
        method: 'POST',
        body: {
          genre_names: genreName.trim(),
          production_ranking_number: 'ASC',
        },
      });
    }
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(el);
    }
  };

  return (
    <div className="card">
      {role === 'admin' && (
        <button
          type="button"
          className="card-edit-btn"
          onClick={handleEditClick}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          title={t('edit') || 'Editar'}
          aria-label={t('edit') || 'Editar serie'}
        >
          ✏️
        </button>
      )}
      <button
        type="button"
        className="card-close-btn"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onDelete) {
            onDelete();
          }
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        title={t('close') || 'Cerrar'}
        aria-label={t('close') || 'Cerrar tarjeta'}
      >
        ×
      </button>
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
                <h2>{`#${displayNumber}. ${production_name}`}</h2>
                <hr />
                <p className="production-desc">{description}</p>
                <div className="tags">
                  <span
                    className="tag year"
                    onClick={handleYearClick}
                    title={t('filterByYear') || 'Filter by year'}
                  >
                    {`${production_year}`}
                  </span>
                  <span
                    className="tag ep"
                    onClick={handleEpisodesClick}
                    title={t('filterByEpisodes') || 'Filter by episodes'}
                  >
                    {`${production_number_chapters} Ep`}
                  </span>
                  <span
                    className="tag"
                    onClick={handleDemographicClick}
                    title={t('filterByDemographic') || 'Filter by demographic'}
                  >
                    {demographic_name}
                  </span>
                  {genre_names.split(',').map((genre) => (
                    <span
                      className="tag"
                      key={genre}
                      variant="text"
                      onClick={(e) => handleGenreClick(e, genre)}
                      title={t('filterByGenre') || 'Filter by genre'}
                    >
                      {t(genre)}
                    </span>
                  ))}
                  <button
                    className={`tag read-aloud-tag ${isSpeaking ? 'speaking' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(description, speechLanguage);
                    }}
                    title={isSpeaking ? t('stopReading') : t('readAloud')}
                  >
                    {isSpeaking ? '🔊' : '🔈'}
                  </button>
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
