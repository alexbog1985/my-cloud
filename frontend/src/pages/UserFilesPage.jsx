import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useFiles } from "../hooks/useFiles";
import FileList from "../components/files/FileList";
import LoadingIndicator from "../components/ui/LoadingIndicator";

export default function UserFilesPage() {
  const { userId } = useParams();
  const { users } = useSelector((state) => state.users);
  const { loading } = useSelector(state => state.files);
  const { fetchFiles } = useFiles();

  const user = users.find(u => u.id === parseInt(userId));

  useEffect(() => {
    fetchFiles(userId).catch(console.error);
  }, [userId, fetchFiles]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <LoadingIndicator size="lg" text="Загрузка файлов..." />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Файлы пользователя {user?.username || userId}</h1>
      <FileList />
    </div>
  );
}