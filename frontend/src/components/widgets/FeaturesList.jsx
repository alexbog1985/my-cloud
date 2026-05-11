import {Link} from "react-router-dom";

export default function FeaturesList() {
  return (
    <section className="text-center mb-5 py-5">
      <h2 className="mb-4">Возможности</h2>
      <ul className="list-unstyled d-inline-block text-start" style={{maxWidth: '400px'}}>
        <li className="mb-3">Загружайте и скачивайте файлы</li>
        <li className="mb-3">Делитесь ссылками с друзьями</li>
      </ul>
    </section>
  )
}