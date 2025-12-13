import React, { useState } from 'react';
import './searchMethod.css';

const SearchMethod = ({ setOpt, t, isFormVisible, setIsFormVisible, navigation }) => {
  const genreOptions = [
    { id: 1, name: 'Acción', slug: 'accion' },
    { id: 2, name: 'Psicologico', slug: 'psicologico' },
    { id: 3, name: 'Magia', slug: 'magia' },
    { id: 4, name: 'Drama', slug: 'drama' },
    { id: 5, name: 'Comedia', slug: 'comedia' },
    { id: 6, name: 'Ciencia ficción', slug: 'ciencia-ficcion' },
    { id: 7, name: 'Fantasía', slug: 'fantasia' },
    { id: 8, name: 'Terror', slug: 'terror' },
    { id: 9, name: 'Romance', slug: 'romance' },
    { id: 10, name: 'Musical', slug: 'musical' },
    { id: 12, name: 'Suspenso', slug: 'suspenso' },
    { id: 13, name: 'Histórico', slug: 'historico' },
    { id: 14, name: 'Bélico', slug: 'belico' },
    { id: 15, name: 'Policíaco', slug: 'policiaco' },
    { id: 16, name: 'Aventura', slug: 'aventura' },
    { id: 17, name: 'Samuráis', slug: 'samurais' },
    { id: 19, name: 'Gore', slug: 'gore' },
    { id: 20, name: 'Space ópera', slug: 'space-opera' },
    { id: 21, name: 'Mecha', slug: 'mecha' },
    { id: 22, name: 'Cyberpunk', slug: 'ciberpunk' },
    { id: 23, name: 'H', slug: 'h' },
    { id: 24, name: 'Otaku', slug: 'otaku' },
    { id: 25, name: 'Deporte', slug: 'deporte' },
    { id: 26, name: 'Yaoi', slug: 'yaoi' },
    { id: 27, name: 'Post Apocalíptico', slug: 'post-apocaliptico' },
    { id: 28, name: 'Entretenimiento', slug: 'entretenimiento' },
    { id: 29, name: 'Realismo', slug: 'realismo' },
    { id: 30, name: 'Horror', slug: 'horror' },
    { id: 31, name: 'Western Espacial', slug: 'western-espacial' },
    { id: 32, name: 'Neo-noir', slug: 'neo-noir' },
    { id: 33, name: 'Sobrenatural', slug: 'sobrenatural' },
    { id: 34, name: 'Hentai', slug: 'hentai' },
    { id: 35, name: 'Crimen', slug: 'crimen' },
    { id: 36, name: 'Misterio', slug: 'misterio' },
    { id: 37, name: 'Yuri', slug: 'yuri' },
    { id: 38, name: 'Filosófico', slug: 'filosofico' },
    { id: 39, name: 'Paranormal', slug: 'paranormal' },
    { id: 40, name: 'Terror Psicológico', slug: 'terror-psicológico' },
    { id: 41, name: 'Apocalíptico', slug: 'apocalíptico' },
    { id: 42, name: 'Triller Psicológico', slug: 'triller-sicologico' },
    { id: 43, name: 'Harem', slug: 'harem' },
  ];

  const demographicOptions = [
    { id: 1, name: 'Kodomo', slug: 'kodomo' },
    { id: 2, name: 'Shōnen', slug: 'shonen' },
    { id: 3, name: 'Shōjo', slug: 'shojo' },
    { id: 4, name: 'Seinen', slug: 'seinen' },
    { id: 5, name: 'Josei', slug: 'josei' },
    { id: 6, name: 'Shōnen-Seinen', slug: 'shonen-seinen' },
  ];

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
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  // Función helper para obtener el contenedor con scroll activo (reutilizada de Tab.jsx)
  const getScrollContainer = () => {
    // Buscar cualquier section-tab visible o el documentElement como fallback
    const scrollContainer = document.querySelector('.section-tab') || document.documentElement;
    return scrollContainer;
  };

  const handleScrollToTop = () => {
    const scrollContainer = getScrollContainer();
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

    const requestData = {
      method: 'POST',
      body: conditions,
    };

    setOpt(requestData);

    // Ocultar el formulario después de enviar la búsqueda
    if (setIsFormVisible) {
      setIsFormVisible(false);
    }

    // Ir al inicio después de enviar la búsqueda
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
                placeholder="e.g. 1,10"
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
                placeholder="e.g. 1994,1995"
                value={form.production_year}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>{t('genreNames')}</label>
              <select name="genre_names" value={form.genre_names} onChange={handleChange}>
                <option value="">{t('selectGenre')}</option>
                {genreOptions.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
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
                  <option key={option.id} value={option.slug}>
                    {option.name}
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
