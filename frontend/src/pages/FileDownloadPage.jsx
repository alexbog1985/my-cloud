import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFiles } from "../hooks/useFiles";

export default function FileDownloadPage() {
  const { specialLink } = useParams();
  const { downloadByLink } = useFiles();

  useEffect(() => {
    downloadByLink(specialLink);
  }, [specialLink, downloadByLink]);

  return (
    <div>Скачивание файла...</div>
  )
}