import { useEffect } from 'react';

function useScrollEnabled(shouldEnable = true) {
  useEffect(() => {
    if (shouldEnable) {
      document.body.style.overflow = 'auto !important'; // Adicionado !important
    } else {
      document.body.style.overflow = 'hidden !important'; // Adicionado !important
    }

    return () => {
      document.body.style.overflow = ''; 
    };
  }, [shouldEnable]); 
}

export default useScrollEnabled;