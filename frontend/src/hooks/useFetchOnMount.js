import { useEffect } from "react";

export const useFetchOnMount = (fetchFunction) => {
  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    fetchFunction()
      .then(() => {})
      .catch(err => {
        if (isMounted && err.name !== "AbortError") {
          console.error('Ошибка при загрузке данных:', err);
        }
      })
      .finally(() => {
        if (isMounted) {
          isMounted = false;
        }
      });

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [fetchFunction]);
};
