import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFiles } from "../hooks/useFiles";
import {useSelector} from "react-redux";

export default function FileDownloadPage() {
  const { specialLink } = useParams();
  const { downloadByLink } = useFiles();

  useEffect(() => {
    downloadByLink(specialLink).then();
  }, [specialLink, downloadByLink]);

  return (
    <div className="container py-5">
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-3">Скачивание файла...</p>
      </div>
    </div>
  )
}