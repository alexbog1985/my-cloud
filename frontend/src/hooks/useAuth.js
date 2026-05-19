import { useDispatch} from "react-redux";
import { setLoading, setUser } from "../store/slices/authSlice.js";
import { useApi } from "./useApi.js";
import { useCallback } from "react";

export function useAuth() {
  const dispatch = useDispatch();

  const { request } = useApi()

  const fetchUser = useCallback(async () => {
    try {
      dispatch(setLoading());
      const response = await request({
        url: '/users/me/',
        method: 'GET',
      });
      dispatch(setUser(response.data))
    } catch (error) {
      dispatch(setUser(null))
      console.error(error);
    }
  }, [dispatch, request])
  return { fetchUser };
}
