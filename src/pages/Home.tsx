import HeroBanner from "../components/HeroBanner";
import NewArrivals from "../components/NewArrivals";
import Categories from "../components/Categories";
import Trending from "../components/Trending";
import SaleOffers from "../components/SaleOffers";
import Newsletter from "../components/Newsletter";
export default function Home() {
  return (
    <>
      <HeroBanner />
      <NewArrivals />
      <Categories />
      <Trending />
      <SaleOffers />
      <Newsletter />
    </>
  );
}
