import HeroSection from "../components/widgets/HeroSection";
import FeaturesList from "../components/widgets/FeaturesList";
import Button from "../components/ui/Button";

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