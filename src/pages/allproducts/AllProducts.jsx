import React, { useContext } from "react";
import Layout from "../../components/layout/layout";
import Filter from "../../components/FilterComponents/Filter";
import ProductCard from "../../components/ProductCard/ProductCard";
import myContext from "../../context/data/myContext";

function AllProducts() {
  const context = useContext(myContext);
  const { mode } = context;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1
            className="sm:text-4xl text-3xl font-bold title-font mb-4 text-gray-900"
            style={{ color: mode === "dark" ? "white" : "" }}
          >
            All Products
          </h1>
          <p
            className="text-base leading-relaxed xl:w-2/4 lg:w-3/4 mx-auto text-gray-500"
            style={{ color: mode === "dark" ? "white" : "" }}
          >
            Browse our complete collection of fresh groceries and healthy
            products
          </p>
          <div className="flex mt-6 justify-center">
            <div className="w-32 h-1 rounded-full bg-pink-600 inline-flex"></div>
          </div>
        </div>

        <Filter />
        <ProductCard />
      </div>
    </Layout>
  );
}

export default AllProducts;
