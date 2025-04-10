import { useState, useEffect } from 'react';

const useVersion = () => {
  const [version, setVersion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/version.json')
      .then(response => response.json())
      .then(data => setVersion(data))
      .catch(err => setError(err));
  }, []);

  return { version, error };
};

export default useVersion;
