import React, { useState, useEffect } from 'react';
import './searchMethod.css';
import helpHttp from '../../helpers/helpHttp';
import set from '../../helpers/set.json';
import { useLanguage } from '../../hooks/useLanguage';

const CACHE_GENRES = 'options_genres';
const CACHE_DEMOGRAPHICS = 'options_demographics';

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const SearchMethod = ({ setOpt, t, isFormVisible, setIsFormVisible }) => {
  const { t: translate } = useLanguage();

  const [genreOptions, setGenreOptions] = useState(() => readCache(CACHE_GENRES) || []);
  const [demographicOptions, setDemographicOptions] = useState(() => readCache(CACHE_DEMOGRAPHICS) || []);

  useEffect(() => {
    const base = set.base_url;

    helpHttp.get(`${base}api/series/genres`).then((res) => {
      if (!res?.err) {
        const list = res.genres || res.data || [];
        if (list.length > 0) {
          localStorage.setItem(CACHE_GENRES, JSON.stringify(list));
          setGenreOptions(list);
        }
      }
    });

    helpHttp.get(`${base}api/series/demographics`).then((res) => {
      if (!res?.err) {
        const list = res.demographics || res.data || [];
        if (list.length > 0) {
          localStorage.setItem(CACHE_DEMOGRAPHICS, JSON.stringify(list));
          setDemographicOptions(list);
        }
      }
    });
  }, []);

  const [form, setForm] = useState({
    production_name: '',
    production_number_chapters: '',
    production_description: '',
    production_year: '',
    demographic_name: '',
    genre_names: '',
    production_ranking_number: 'ASC',
    limit: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'genre_names') {
      setForm({
        ...form,
        genre_names: form.genre_names ? `${form.genre_names},${value}` : value,
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleScrollToTop = () => {
    const scrollContainer = document.querySelector('.section-tab') || document.documentElement;
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const conditions = {};
    Object.keys(form).forEach((key) => {
      if (form[key]) {
        conditions[key] = key === 'limit' ? parseInt(form[key], 10) : form[key];
      }
    });
    setOpt({ method: 'POST', body: conditions });
    if (setIsFormVisible) setIsFormVisible(false);
    handleScrollToTop();
  };

  const handleReset = () => {
    setForm({
      production_name: '',
      production_number_chapters: '',
      production_description: '',
      production_year: '',
      demographic_name: '',
      genre_names: '',
      production_ranking_number: 'ASC',
      limit: '',
    });
  };

  return (
    <div className="toggle-search form-container">
      {isFormVisible && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('seriesName')}</label>
              <input
                type="text"
                name="production_name"
                placeholder={t('seriesName')}
                value={form.production_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>{t('numberOfChapters')}</label>
              <input
                type="text"
                name="production_number_chapters"
                placeholder={t('numberOfChaptersPlaceholder')}
                value={form.production_number_chapters}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>{t('description')}</label>
              <input
                type="text"
                name="production_description"
                placeholder={t('description')}
                value={form.production_description}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>{t('productionYear')}</label>
              <input
                type="text"
                name="production_year"
                placeholder={t('productionYearPlaceholder')}
                value={form.production_year}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>{t('genreNames')}</label>
              <select name="genre_names" value={''} onChange={handleChange}>
                <option value="">{t('selectGenre')}</option>
                {genreOptions.map((option) => (
                  <option key={option.id} value={option.name}>
                    {translate(option.name)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t('genreNames')}</label>
              <input
                type="text"
                name="genre_names"
                placeholder={t('genreNames')}
                value={form.genre_names}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>{t('demographicNames')}</label>
              <select name="demographic_name" value={form.demographic_name} onChange={handleChange}>
                <option value="">{t('selectDemographic')}</option>
                {demographicOptions.map((option) => (
                  <option key={option.id} value={option.slug || option.name}>
                    {translate(option.name)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t('rankingOrder')}</label>
              <select
                name="production_ranking_number"
                value={form.production_ranking_number}
                onChange={handleChange}
              >
                <option value="ASC">{t('ascending')}</option>
                <option value="DESC">{t('descending')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('limit')}</label>
              <input
                type="number"
                name="limit"
                placeholder={t('limit')}
                value={form.limit}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <input type="submit" value={t('search')} />
              <input type="reset" value={t('reset')} onClick={handleReset} />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SearchMethod;
