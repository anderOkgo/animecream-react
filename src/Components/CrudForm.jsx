import React, { useState, useEffect } from 'react';

const initailForm = {
  production_name: '',
  limit: '',
};

const CrudForm = ({ setOpt }) => {
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
      alert('Datos incompletos');
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
    <div>
      <h3>Search Method</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="production_name"
          placeholder="Name"
          onChange={handleChange}
          value={form.production_name}
        />
        <input type="text" name="limit" placeholder="Limit" onChange={handleChange} value={form.limit} />
        <input type="submit" value="Enviar" />
        <input type="reset" value="Limpiar" onClick={handleReset} />
      </form>
    </div>
  );
};

export default CrudForm;
