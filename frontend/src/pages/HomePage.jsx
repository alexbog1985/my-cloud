import HeroSection from "../components/widgets/HeroSection.jsx";
import FeaturesList from "../components/widgets/FeaturesList.jsx";
import Button from "../components/ui/Button.jsx";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesList />

      <section className="d-flex justify-content-center gap-3">
        <Button to="/register" variant="primary">Зарегистрироваться</Button>
        <Button to="/login" variant="outline-primary">Войти</Button>
      </section>
    </>
  )
}