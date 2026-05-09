import { Link } from 'react-router-dom'
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import HeroSection from "../components/widgets/HeroSection.jsx";
import FeaturesList from "../components/widgets/FeaturesList.jsx";
import Button from "../components/ui/Button.jsx";

export default function HomePage() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 py-5">
        <div className="container">
          <HeroSection />
          <FeaturesList />

          <section className="d-flex justify-content-center gap-3">
            <Button to="/register" variant="primary">Зарегистрироваться</Button>
            <Button to="/login" variant="outline-primary">Войти</Button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}