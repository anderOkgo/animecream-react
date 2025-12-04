import { useState, useEffect } from 'react';
import helpHttp from '../../helpers/helpHttp';
import set from '../../helpers/set.json';
import AuthService from '../../services/auth.service';
import './AdminPanel.css';

const AdminPanel = ({ t, seriesToEdit, onEditCancel, onEditComplete }) => {
  const isEditMode = !!seriesToEdit;
  const [jsonData, setJsonData] = useState('');
  const [useForm, setUseForm] = useState(isEditMode); // Default to form in edit mode
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [seriesId, setSeriesId] = useState(null);
  const [loadingSeries, setLoadingSeries] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    chapter_number: 0,
    description: '',
    description_en: '',
    qualification: 0,
    demography_id: 1,
    visible: true,
    genres: [],
    titles: [],
  });

  // Options from API
  const [genres, setGenres] = useState([]);
  const [demographics, setDemographics] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Store original genres and titles for comparison
  const [originalGenres, setOriginalGenres] = useState([]);
  const [originalTitles, setOriginalTitles] = useState([]); // IDs for removal
  const [originalTitleNames, setOriginalTitleNames] = useState([]); // Names for comparison

  // Load genres and demographics
  useEffect(() => {
    loadOptions();
  }, []);

  // Load series data when in edit mode
  useEffect(() => {
    if (isEditMode && seriesToEdit) {
      setLoadingSeries(true);
      loadSeriesData();
    } else {
      // Reset form when not in edit mode
      setJsonData('');
      setImageFile(null);
      setSeriesId(null);
      resetForm();
      setOriginalGenres([]);
      setOriginalTitles([]);
      setOriginalTitleNames([]);
    }
  }, [seriesToEdit]);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const currentUser = AuthService.getCurrentUser();
      const token = currentUser?.token ? `Bearer ${currentUser.token}` : '';

      const genresUrl = set.base_url + 'api/series/genres';
      const demographicsUrl = set.base_url + 'api/series/demographics';

      const [genresResponse, demographicsResponse] = await Promise.all([
        helpHttp.get(genresUrl, { token }),
        helpHttp.get(demographicsUrl, { token }),
      ]);

      if (!genresResponse?.err) {
        const genresList = genresResponse.genres || genresResponse.data || [];
        setGenres(genresList);
      }

      if (!demographicsResponse?.err) {
        const demographicsList = demographicsResponse.demographics || demographicsResponse.data || [];
        setDemographics(demographicsList);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadSeriesData = async () => {
    try {
      // Ensure options are loaded first
      if (demographics.length === 0 || genres.length === 0) {
        await loadOptions();
      }

      const seriesId = seriesToEdit.id;

      if (!seriesId) {
        createJsonFromSeriesData(seriesToEdit);
        loadFormFromSeriesData(seriesToEdit);
        setLoadingSeries(false);
        return;
      }

      const currentUser = AuthService.getCurrentUser();
      const token = currentUser?.token ? `Bearer ${currentUser.token}` : '';

      const url = set.base_url + set.api_url + seriesId;
      const response = await helpHttp.get(url, { token: token });

      if (response?.err) {
        createJsonFromSeriesData(seriesToEdit);
        loadFormFromSeriesData(seriesToEdit);
        setLoadingSeries(false);
        return;
      }

      const seriesData = response.data || response;
      setSeriesId(seriesData.id || seriesId);

      createJsonFromSeriesData(seriesData);
      loadFormFromSeriesData(seriesData);
    } catch (error) {
      createJsonFromSeriesData(seriesToEdit);
      loadFormFromSeriesData(seriesToEdit);
    } finally {
      setLoadingSeries(false);
    }
  };

  const createJsonFromSeriesData = (data) => {
    // Extract genres - handle different structures
    let genreIds = [];
    if (data.genres) {
      if (Array.isArray(data.genres)) {
        genreIds = data.genres
          .map((g) => {
            if (typeof g === 'object' && g.id) {
              return g.id;
            }
            return typeof g === 'number' ? g : null;
          })
          .filter((id) => id !== null);
      }
    }

    // Extract titles - handle different structures
    let titlesList = [];
    if (data.titles) {
      if (Array.isArray(data.titles)) {
        titlesList = data.titles
          .map((t) => {
            if (typeof t === 'object' && t.name) {
              return t.name;
            }
            return typeof t === 'string' ? t : '';
          })
          .filter((t) => t !== '');
      }
    }

    // Extract demography_id
    const demographyId = data.demography_id || data.demography?.id || 1;

    // Create JSON structure from series data
    const jsonStructure = {
      name: data.production_name || data.name || '',
      year: data.production_year || data.year || '',
      chapter_number: data.production_number_chapters || data.chapter_number || data.chapterNumber || 0,
      description: data.production_description || data.description || '',
      description_en: data.production_description_en || data.description_en || data.descriptionEn || '',
      qualification: data.qualification || data.qualification_number || 0,
      demography_id: demographyId,
      visible:
        data.visible !== undefined ? data.visible : data.visible_flag !== undefined ? data.visible_flag : true,
      genres: genreIds,
      titles: titlesList,
    };

    setJsonData(JSON.stringify(jsonStructure, null, 2));
  };

  const loadFormFromSeriesData = (data) => {
    // Extract genres
    let genreIds = [];
    if (data.genres && Array.isArray(data.genres)) {
      genreIds = data.genres
        .map((g) => {
          if (typeof g === 'object' && g.id !== undefined) {
            return Number(g.id);
          }
          return typeof g === 'number' ? g : null;
        })
        .filter((id) => id !== null && !isNaN(id));
    }

    // Save original genres (sorted for comparison)
    setOriginalGenres([...genreIds].sort((a, b) => a - b));

    // Extract titles - save both IDs and names
    let titlesList = [];
    let titleIds = [];
    let titleNames = [];
    if (data.titles && Array.isArray(data.titles)) {
      data.titles.forEach((t) => {
        if (typeof t === 'object' && t.name) {
          titlesList.push(t.name);
          titleNames.push(t.name.toLowerCase().trim());
          if (t.id) {
            titleIds.push(Number(t.id));
          }
        } else if (typeof t === 'string' && t.trim() !== '') {
          titlesList.push(t);
          titleNames.push(t.toLowerCase().trim());
        }
      });
    }

    // Save original title IDs for removal and names for comparison
    setOriginalTitles(titleIds);
    setOriginalTitleNames(titleNames.sort());

    // Extract demography_id
    let demographyId = data.demography_id;
    if (!demographyId && data.demographic_name && demographics.length > 0) {
      const matchedDemo = demographics.find(
        (d) => d.name === data.demographic_name || d.name?.toLowerCase() === data.demographic_name?.toLowerCase()
      );
      if (matchedDemo) {
        demographyId = matchedDemo.id;
      }
    }
    if (!demographyId) {
      demographyId = 1;
    }

    setFormData({
      name: data.production_name || data.name || '',
      year: data.production_year || data.year || '',
      chapter_number: data.production_number_chapters || data.chapter_number || data.chapterNumber || 0,
      description: data.production_description || data.description || '',
      description_en: data.production_description_en || data.description_en || data.descriptionEn || '',
      qualification: Number(data.qualification || data.qualification_number || 0),
      demography_id: Number(demographyId),
      visible:
        data.visible !== undefined ? data.visible : data.visible_flag !== undefined ? data.visible_flag : true,
      genres: genreIds,
      titles: titlesList.length > 0 ? titlesList : [''],
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      year: '',
      chapter_number: 0,
      description: '',
      description_en: '',
      qualification: 0,
      demography_id: 1,
      visible: true,
      genres: [],
      titles: [],
    });
  };

  const handleJsonChange = (e) => {
    setJsonData(e.target.value);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleGenreChange = (genreId) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId],
    }));
  };

  const handleTitleChange = (index, value) => {
    setFormData((prev) => {
      const newTitles = [...prev.titles];
      newTitles[index] = value;
      return { ...prev, titles: newTitles };
    });
  };

  const handleAddTitle = () => {
    setFormData((prev) => ({
      ...prev,
      titles: [...prev.titles, ''],
    }));
  };

  const handleRemoveTitle = (index) => {
    setFormData((prev) => ({
      ...prev,
      titles: prev.titles.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const getSeriesDataForSubmit = () => {
    if (useForm) {
      return {
        ...formData,
        year: Number(formData.year),
        chapter_number: Number(formData.chapter_number),
        qualification: Number(formData.qualification),
        demography_id: Number(formData.demography_id),
        genres: formData.genres.map((id) => Number(id)),
        titles: formData.titles.filter((t) => t.trim() !== ''),
      };
    } else {
      return JSON.parse(jsonData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // In edit mode, image is optional (only if user wants to change it)
    if (!isEditMode && !imageFile) {
      setMessage({
        type: 'error',
        text: t('imageRequired') || 'Image is required',
      });
      setLoading(false);
      return;
    }

    try {
      // Get series data
      let seriesData;
      try {
        seriesData = getSeriesDataForSubmit();
      } catch (parseError) {
        setMessage({
          type: 'error',
          text: 'Invalid data format: ' + parseError.message,
        });
        setLoading(false);
        return;
      }

      // Get token from current user
      const currentUser = AuthService.getCurrentUser();
      const token = currentUser?.token ? `Bearer ${currentUser.token}` : '';

      if (isEditMode && seriesId) {
        // Update existing series using PUT /api/series/{id}
        const updateUrl = set.base_url + set.api_url + seriesId;
        const updateResponse = await helpHttp.put(updateUrl, {
          body: seriesData,
          token: token,
        });

        if (updateResponse?.err) {
          setMessage({
            type: 'error',
            text: updateResponse.err.message || 'Error updating series',
          });
          setLoading(false);
          return;
        }

        // Update genres if they changed
        const newGenreIds = seriesData.genres
          ? seriesData.genres.map((id) => Number(id)).sort((a, b) => a - b)
          : [];
        const genresChanged = JSON.stringify(newGenreIds) !== JSON.stringify(originalGenres);

        if (genresChanged) {
          const genresUrl = set.base_url + set.api_url + `${seriesId}/genres`;
          const genresResponse = await helpHttp.post(genresUrl, {
            body: { genreIds: newGenreIds },
            token: token,
          });

          if (genresResponse?.err) {
            setMessage({
              type: 'warning',
              text: `Series updated but genres update failed: ${genresResponse.err.message || 'Unknown error'}`,
            });
            setLoading(false);
            return;
          }
        }

        // Update titles if they changed
        const newTitles = seriesData.titles ? seriesData.titles.filter((t) => t.trim() !== '') : [];
        const newTitlesNormalized = newTitles.map((t) => t.toLowerCase().trim()).sort();
        const titlesChanged = JSON.stringify(newTitlesNormalized) !== JSON.stringify(originalTitleNames);

        if (titlesChanged) {
          // Remove all existing titles
          if (originalTitles.length > 0) {
            const removeTitlesUrl = set.base_url + set.api_url + `${seriesId}/titles`;
            const removeResponse = await helpHttp.del(removeTitlesUrl, {
              body: { titleIds: originalTitles },
              token: token,
            });

            if (removeResponse?.err) {
              setMessage({
                type: 'warning',
                text: `Series updated but failed to remove old titles: ${
                  removeResponse.err.message || 'Unknown error'
                }`,
              });
              setLoading(false);
              return;
            }
          }

          // Add new titles if any
          if (newTitles.length > 0) {
            const addTitlesUrl = set.base_url + set.api_url + `${seriesId}/titles`;
            const addResponse = await helpHttp.post(addTitlesUrl, {
              body: { titles: newTitles },
              token: token,
            });

            if (addResponse?.err) {
              setMessage({
                type: 'warning',
                text: `Series updated but failed to add new titles: ${addResponse.err.message || 'Unknown error'}`,
              });
              setLoading(false);
              return;
            }
          }
        }

        // Upload image if provided
        if (imageFile) {
          const imageUrl = set.base_url + set.api_url + `${seriesId}/image`;
          const formDataImage = new FormData();
          formDataImage.append('image', imageFile);

          const imageResponse = await fetch(imageUrl, {
            method: 'PUT',
            body: formDataImage,
            headers: {
              Authorization: token,
            },
          });

          const imageResult = await imageResponse.json();

          if (!imageResponse.ok || imageResult?.err) {
            setMessage({
              type: 'warning',
              text: `Series updated but image upload failed: ${
                imageResult?.err?.message || imageResult?.message || 'Unknown error'
              }`,
            });
            setLoading(false);
            return;
          }
        }

        setMessage({
          type: 'success',
          text: `Series updated successfully! ID: ${seriesId}`,
        });

        if (onEditComplete) {
          setTimeout(() => {
            onEditComplete();
          }, 1500);
        }
      } else {
        // Create new series
        if (!imageFile) {
          setMessage({
            type: 'error',
            text: t('imageRequired') || 'Image is required',
          });
          setLoading(false);
          return;
        }

        const url = set.base_url + set.api_url + 'create-complete';
        const createResponse = await helpHttp.post(url, {
          body: seriesData,
          token: token,
        });

        if (createResponse?.err) {
          setMessage({
            type: 'error',
            text: createResponse.err.message || 'Error creating series',
          });
          setLoading(false);
          return;
        }

        const newSeriesId = createResponse.id;

        if (!newSeriesId) {
          setMessage({
            type: 'error',
            text: 'Series created but no ID returned',
          });
          setLoading(false);
          return;
        }

        // Upload image with the returned ID
        const imageUrl = set.base_url + set.api_url + `${newSeriesId}/image`;
        const formDataImage = new FormData();
        formDataImage.append('image', imageFile);

        const imageResponse = await fetch(imageUrl, {
          method: 'PUT',
          body: formDataImage,
          headers: {
            Authorization: token,
          },
        });

        const imageResult = await imageResponse.json();

        if (!imageResponse.ok || imageResult?.err) {
          setMessage({
            type: 'warning',
            text: `Series created (ID: ${newSeriesId}) but image upload failed: ${
              imageResult?.err?.message || imageResult?.message || 'Unknown error'
            }`,
          });
          setLoading(false);
          return;
        }

        setMessage({
          type: 'success',
          text: `Series created successfully! ID: ${newSeriesId} (Image uploaded)`,
        });

        // Reset form
        setJsonData('');
        resetForm();
        setImageFile(null);
        const fileInput = document.getElementById('image');
        if (fileInput) {
          fileInput.value = '';
        }

        // Refresh series and switch to Series tab
        if (onEditComplete) {
          setTimeout(() => {
            onEditComplete();
          }, 1500);
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error: ${error.message || 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <h2>{isEditMode ? t('editSeries') || 'Edit Series' : t('createSeries') || 'Create Series'}</h2>

      {isEditMode && (
        <button type="button" className="btn-cancel" onClick={onEditCancel} disabled={loading}>
          {t('cancel') || 'Cancel'}
        </button>
      )}

      {loadingSeries && (
        <div className="admin-message admin-message-info">{t('loadingSeries') || 'Loading series data...'}</div>
      )}

      {message && <div className={`admin-message admin-message-${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Toggle between Form and JSON */}
        <div className="form-toggle">
          <label>
            <input type="radio" name="inputMode" checked={useForm} onChange={() => setUseForm(true)} />
            {t('useForm') || 'Use Form'}
          </label>
          <label>
            <input type="radio" name="inputMode" checked={!useForm} onChange={() => setUseForm(false)} />
            {t('useJSON') || 'Use JSON'}
          </label>
        </div>

        {useForm ? (
          /* Form Mode */
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="name">
                {t('seriesName') || 'Series Name'} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                disabled={loadingSeries}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year">
                  {t('year') || 'Year'} <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleFormChange}
                  required
                  disabled={loadingSeries}
                />
              </div>

              <div className="form-group">
                <label htmlFor="chapter_number">{t('chapters') || 'Chapters'}</label>
                <input
                  type="number"
                  id="chapter_number"
                  name="chapter_number"
                  value={formData.chapter_number}
                  onChange={handleFormChange}
                  min="0"
                  disabled={loadingSeries}
                />
              </div>

              <div className="form-group">
                <label htmlFor="qualification">{t('qualification') || 'Qualification'}</label>
                <input
                  type="number"
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleFormChange}
                  min="0"
                  max="10"
                  step="0.001"
                  disabled={loadingSeries}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">{t('description') || 'Description (ES)'}</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="4"
                disabled={loadingSeries}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description_en">{t('descriptionEn') || 'Description (EN)'}</label>
              <textarea
                id="description_en"
                name="description_en"
                value={formData.description_en}
                onChange={handleFormChange}
                rows="4"
                disabled={loadingSeries}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="demography_id">
                  {t('demographic') || 'Demographic'} <span className="required">*</span>
                </label>
                <select
                  id="demography_id"
                  name="demography_id"
                  value={formData.demography_id}
                  onChange={handleFormChange}
                  required
                  disabled={loadingSeries || loadingOptions}
                >
                  {demographics.map((demo) => (
                    <option key={demo.id} value={Number(demo.id)}>
                      {demo.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  {t('visible') || 'Visible'}
                  <input
                    type="checkbox"
                    name="visible"
                    checked={formData.visible}
                    onChange={handleFormChange}
                    disabled={loadingSeries}
                  />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>{t('genres') || 'Genres'}</label>
              {loadingOptions ? (
                <p>{t('loading') || 'Loading...'}</p>
              ) : (
                <div className="checkbox-group">
                  {genres.map((genre) => (
                    <label key={genre.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.genres.map((g) => Number(g)).includes(Number(genre.id))}
                        onChange={() => handleGenreChange(Number(genre.id))}
                        disabled={loadingSeries}
                      />
                      {genre.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>{t('titles') || 'Alternative Titles'}</label>
              {formData.titles.map((title, index) => (
                <div key={index} className="title-input-group">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                    placeholder={t('alternativeTitle') || 'Alternative title'}
                    disabled={loadingSeries}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTitle(index)}
                    disabled={loadingSeries}
                    className="btn-remove"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddTitle} disabled={loadingSeries} className="btn-add">
                + {t('addTitle') || 'Add Title'}
              </button>
            </div>
          </div>
        ) : (
          /* JSON Mode */
          <div className="form-group">
            <label htmlFor="jsonData">
              {t('seriesData') || 'Series Data (JSON)'} <span className="required">*</span>
            </label>
            <textarea
              id="jsonData"
              name="jsonData"
              value={jsonData}
              onChange={handleJsonChange}
              rows="15"
              placeholder='{"name": "Series Name", "year": 2024, "chapter_number": 0, "description": "", "description_en": "", "qualification": 0, "demography_id": 1, "visible": true, "genres": [1, 2], "titles": ["Title1", "Title2"]}'
              required
              disabled={loadingSeries}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="image">
            {t('image') || 'Series Image'} {!isEditMode && <span className="required">*</span>}
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            required={!isEditMode}
            disabled={loadingSeries}
          />
          {imageFile && (
            <div className="image-preview">
              <p>
                {t('selectedFile') || 'Selected'}: {imageFile.name}
              </p>
            </div>
          )}
          {isEditMode && !imageFile && (
            <p className="form-hint">{t('imageOptional') || 'Leave empty to keep current image'}</p>
          )}
          {!isEditMode && !imageFile && (
            <p className="form-hint">{t('imageRequired') || 'Image is required to create a series'}</p>
          )}
        </div>

        <button type="submit" className="btn-submit" disabled={loading || loadingSeries}>
          {loading
            ? isEditMode
              ? t('updating') || 'Updating...'
              : t('creating') || 'Creating...'
            : isEditMode
            ? t('updateSeries') || 'Update Series'
            : t('createSeries') || 'Create Series'}
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;
