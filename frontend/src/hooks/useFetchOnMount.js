import { useEffect } from "react";

export const useFetchOnMount = (fetchFunction) => {
  useEffect(() => {
    let isMounted = true;

    fetchFunction().catch(error => {
      if (isMounted) {
        console.error('Ошибка при загрузке данных:', error);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fetchFunction]);
};
