import { useDispatch} from "react-redux";
import { setUser } from "../store/slices/authSlice.js";
import { useApi } from "./useApi.js";

export function useAuth() {
  const dispatch = useDispatch();

  const { request } = useApi()

  const fetchUser = async () => {
    try {
      const response = await request({
        url: '/users/me',
        method: 'GET',
      });
      dispatch(setUser(response.data))
    } catch (error) {
      console.error(error);
    }
  }
  return { fetchUser };
}
