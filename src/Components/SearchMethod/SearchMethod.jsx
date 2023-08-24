import React, { useState, useEffect } from 'react';
import './searchMethod.css';

const initailForm = {
  production_name: '',
  limit: '',
};

const SearchMethod = ({ setOpt }) => {
  const [form, setForm] = useState(initailForm);

  useEffect(() => {
    setForm(initailForm);
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.production_name || !form.limit) {
      alert('Missing Data');
      return;
    }

    setOpt({
      method: 'POST',
      body: form,
    });

    handleReset();
  };

  const handleReset = (e) => {
    setForm(initailForm);
  };

  return (
    <div className="form-container">
      <h3>Search Method</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="production_name"
            placeholder="Name"
            onChange={handleChange}
            value={form.production_name}
          />
        </div>
        <div className="form-group">
          <label>Limit</label>
          <input type="text" name="limit" placeholder="Limit" onChange={handleChange} value={form.limit} />
        </div>
        <div className="form-group">
          <input type="submit" value="Send" />
          <input type="reset" value="Reset" onClick={handleReset} />
        </div>
      </form>
    </div>
  );
};

export default SearchMethod;
