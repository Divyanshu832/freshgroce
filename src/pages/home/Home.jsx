import React, { useContext } from "react";
import Layout from "../../components/layout/layout";
import HeroSection from "../../components/HeroSection/herosection";
import Filter from "../../components/FilterComponents/Filter";
import ProductCard from "../../components/ProductCard/ProductCard";
import Track from "../../components/track/Track";
import Testimonial from "../../components/testimonial/Testimonial";
import WelcomeModal from "../../components/WelcomeModal/WelcomeModal";
import FlashSale from "../../components/FlashSale/FlashSale";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, deleteFromCart } from "../../redux/cartSlice";

function Home() {
  const dispatch = useDispatch();
  const cartItem = useSelector((state) => state.cart);

  console.log(cartItem);

  return (
    <Layout>
      <WelcomeModal />
      <HeroSection />
      <FlashSale />
      <ProductCard />
      <Track />
      <Testimonial />
    </Layout>
  );
}

export default Home;
