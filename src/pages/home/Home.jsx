import React, { useContext } from 'react'
import Layout from '../../components/layout/layout'
import HeroSection from '../../components/HeroSection/herosection'
import Filter from '../../components/FilterComponents/filter'
import ProductCard from '../../components/ProductCard/ProductCard'
import Track from '../../components/track/Track'
import Testimonial from '../../components/testimonial/Testimonial'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, deleteFromCart } from '../../redux/cartSlice'

function Home() {
  const dispatch = useDispatch();
  const cartItem = useSelector((state)=> state.cart)

  console.log(cartItem)

  return (
    <Layout>
      <HeroSection />
      <Filter />
      <ProductCard />
      <Track />
      <Testimonial />
    </Layout>
  )
}

export default Home