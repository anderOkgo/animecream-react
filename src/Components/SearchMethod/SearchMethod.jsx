import React, { useState } from 'react';
import './searchMethod.css';

const SearchMethod = ({ setOpt }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const conditions = {};
      if (form.production_name) conditions.production_name = form.production_name;
      if (form.production_number_chapters) conditions.production_number_chapters = form.production_number_chapters;
      if (form.production_description) conditions.production_description = form.production_description;
      if (form.production_year) conditions.production_year = form.production_year;
      if (form.demographic_name) conditions.demographic_name = form.demographic_name;
      if (form.genre_names) conditions.genre_names = form.genre_names;
      if (form.limit) conditions.limit = parseInt(form.limit, 10);

      setOpt({
        method: 'POST',
        body: conditions,
      });
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleReset = () => {
    setForm({
      production_name: '',
      production_number_chapters: '',
      production_description: '',
      production_year: '',
      demographic_name: '',
      genre_names: '',
      limit: '',
    });
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <div>
      <span variant="text" onClick={toggleFormVisibility} className=" tag" style={{ cursor: 'pointer' }}>
        {isFormVisible ? 'Close Advance Search' : 'Open Advance Search'}
      </span>

      {isFormVisible && (
        <div className="form-container">
          <h2>Search Method</h2>
          <br />
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Series Name</label>
              <input
                type="text"
                name="production_name"
                placeholder="Name"
                value={form.production_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Number of Chapters</label>
              <input
                type="text"
                name="production_number_chapters"
                placeholder="e.g. 1,10"
                value={form.production_number_chapters}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                name="production_description"
                placeholder="Description"
                value={form.production_description}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Production Year (comma-separated)</label>
              <input
                type="text"
                name="production_year"
                placeholder="e.g. 1994,1995"
                value={form.production_year}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Genre Names</label>
              <select name="genre_names" value={form.genre_names} onChange={handleChange}>
                <option value="">Select Genre</option>
                {genreOptions.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Demographic Names</label>
              <select name="demographic_name" value={form.demographic_name} onChange={handleChange}>
                <option value="">Select Demographic</option>
                {demographicOptions.map((option) => (
                  <option key={option.id} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Limit</label>
              <input type="number" name="limit" placeholder="Limit" value={form.limit} onChange={handleChange} />
            </div>
            <div className="form-group">
              <input type="submit" value="Search" />
              <input type="reset" value="Reset" onClick={handleReset} />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SearchMethod;
