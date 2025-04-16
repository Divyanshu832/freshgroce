import React, { useContext, useEffect, useState } from "react";
import myContext from "../../context/data/myContext";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToCart, decreaseCart } from "../../redux/cartSlice";
import { Link } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa";
import { BsCartPlus } from "react-icons/bs";

function ProductCard() {
  const context = useContext(myContext);
  const { mode, product, searchkey, filterType, filterPrice } = context;
  const [displayProducts, setDisplayProducts] = useState([]);

  // Filter products based on the current page
  useEffect(() => {
    // Check if we're on the homepage
    const isHomePage = window.location.pathname === "/";

    if (isHomePage) {
      // Show only featured products on homepage (maximum 16)
      const featured = product.filter((item) => item.isFeatured === true);
      setDisplayProducts(featured.slice(0, 16));
    } else {
      // Show all products on other pages
      setDisplayProducts(product);
    }
  }, [product]);

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);

  // Get item quantity from cart
  const getItemQuantity = (id) => {
    const item = cartItems.find((item) => item.$id === id);
    return item ? item.quantity : 0;
  };

  // add to cart
  const addCart = (product) => {
    dispatch(addToCart(product));
    toast.success("Item added to cart");
  };

  // decrease from cart
  const decreaseItem = (product) => {
    dispatch(decreaseCart(product));
    toast.info("Item quantity decreased");
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <section className="text-gray-600 mt-10 body-font bg-gradient-to-b from-green-100 to-green-50 dark:from-green-900/30 dark:to-transparent">
      <div className="container px-5 py-8 md:py-16 mx-auto">
        <div className="flex with-full flex-col md:flex-row justify-between items-center mb-6 lg:mb-10">
          <div className="flex w-full flex-col items-center text-center mb-4 md:mb-0 md:items-start md:text-left">
            <h1
              className="sm:text-3xl text-2xl font-bold title-font text-gray-900"
              style={{ color: mode === "dark" ? "white" : "" }}
            >
              Our Products
            </h1>
            <div className="h-1 w-48 bg-green-600 rounded mt-2"></div>
          </div>

          <Link to="/allproducts">
            <button
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center w-24"
              style={{
                backgroundColor: mode === "dark" ? "rgb(21, 128, 61)" : "",
              }}
            >
              View All
            </button>
          </Link>
        </div>

        <div className="flex flex-wrap -m-4">
          {displayProducts
            .filter((obj) =>
              obj.title.toLowerCase().includes(searchkey.toLowerCase())
            )
            .filter((obj) =>
              obj.category.toLowerCase().includes(filterType.toLowerCase())
            )
            .filter((obj) =>
              obj.price.toLowerCase().includes(filterPrice.toLowerCase())
            )
            .map((item, index) => {
              const { title, price, imageUrl, description } = item;
              const productId = item.$id;
              const quantity = getItemQuantity(productId);

              return (
                <div key={index} className="p-4 w-full sm:w-1/2 lg:w-1/4">
                  <div
                    className="group relative rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-gray-100 hover:shadow-2xl drop-shadow-lg"
                    style={{
                      backgroundColor: mode === "dark" ? "rgb(46 49 55)" : "",
                      color: mode === "dark" ? "white" : "",
                    }}
                  >
                    <Link
                      to={`/productinfo/${productId}`}
                      className="block overflow-hidden"
                    >
                      {/* Product Image */}
                      <div className="h-48 overflow-hidden">
                        <img
                          className="w-full h-full object-cover rounded-2xl p-2 hover:scale-110 transition-all duration-300 ease-in-out"
                          src={imageUrl}
                          alt={title}
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4">
                      <h2
                        className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1"
                        style={{ color: mode === "dark" ? "white" : "" }}
                      >
                        FreshGroce
                      </h2>
                      <Link to={`/productinfo/${productId}`}>
                        <h1
                          className="text-lg font-semibold mb-1 truncate"
                          style={{ color: mode === "dark" ? "white" : "" }}
                        >
                          {title}
                        </h1>
                      </Link>
                      <p
                        className="font-bold mb-2"
                        style={{ color: mode === "dark" ? "white" : "" }}
                      >
                        ₹ {price}
                      </p>

                      <p
                        className="text-sm mb-3 line-clamp-2"
                        style={{
                          color: mode === "dark" ? "#9CA3AF" : "#6B7280",
                        }}
                      >
                        {description}
                      </p>

                      {quantity === 0 ? (
                        <div className="flex justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addCart(item);
                            }}
                            type="button"
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                          >
                            <BsCartPlus className="mr-2" />
                            Add To Cart
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              decreaseItem(item);
                            }}
                            className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
                          >
                            <FaMinus size={12} />
                          </button>

                          <span className="text-center font-bold text-lg">
                            {quantity}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addCart(item);
                            }}
                            className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Mobile view "View All" button that shows at bottom */}
      </div>
    </section>
  );
}

export default ProductCard;
