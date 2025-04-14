import React, { useEffect, useState } from "react";
import MyContext from "./myContext";
import { toast } from "react-toastify";
import {
  addProductToDb,
  getAllProducts,
  updateProductInDb,
  deleteProductFromDb,
  getAllOrders,
  getAllUsers,
} from "../../appwrite/databaseUtils";

function MyState(props) {
  const [mode, setMode] = useState("light");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    if (mode === "light") {
      setMode("dark");
      document.body.style.backgroundColor = "rgb(17, 24, 39)";
    } else {
      setMode("light");
      document.body.style.backgroundColor = "white";
    }
  };

  const [products, setProducts] = useState({
    title: null,
    price: null,
    imageUrl: null,
    category: null,
    description: null,
    date: new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
  });

  // ********************** Add Product Section  **********************
  const addProduct = async () => {
    if (
      products.title == null ||
      products.price == null ||
      products.imageUrl == null ||
      products.category == null ||
      products.description == null
    ) {
      return toast.error("Please fill all fields");
    }

    setLoading(true);
    try {
      const response = await addProductToDb(products);
      if (response.success) {
        toast.success("Product Added successfully");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
        getProductData();
        setLoading(false);
      } else {
        toast.error(response.error || "Failed to add product");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred");
      setLoading(false);
    }
    setProducts({
      title: null,
      price: null,
      imageUrl: null,
      category: null,
      description: null,
      time: new Date().toISOString(),
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    });
  };

  const [product, setProduct] = useState([]);

  // ****** get product
  const getProductData = async () => {
    setLoading(true);
    try {
      const response = await getAllProducts();
      if (response.success) {
        setProduct(response.data);
      } else {
        toast.error(response.error || "Failed to fetch products");
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred");
      setLoading(false);
    }
  };

  useEffect(() => {
    getProductData();
  }, []);

  // ****** Edit product
  const edithandle = (item) => {
    setProducts(item);
  };

  // update product
  const updateProduct = async () => {
    setLoading(true);
    try {
      const response = await updateProductInDb(products.$id, products);
      if (response.success) {
        toast.success("Product Updated successfully");
        getProductData();
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        toast.error(response.error || "Failed to update product");
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred");
      setLoading(false);
    }
    setProducts({
      title: null,
      price: null,
      imageUrl: null,
      category: null,
      description: null,
      time: new Date().toISOString(),
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    });
  };

  // ****** Delete product
  const deleteProduct = async (item) => {
    setLoading(true);
    try {
      const response = await deleteProductFromDb(item.$id);
      if (response.success) {
        toast.success("Product Deleted successfully");
        getProductData();
      } else {
        toast.error(response.error || "Product Deletion Failed");
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Product Deletion Failed");
      setLoading(false);
    }
  };

  const [order, setOrder] = useState([]);

  const getOrderData = async () => {
    setLoading(true);
    try {
      const response = await getAllOrders();
      if (response.success) {
        setOrder(response.data);
      } else {
        toast.error(response.error || "Failed to fetch orders");
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred");
      setLoading(false);
    }
  };

  const [user, setUser] = useState([]);

  const getUserData = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      if (response.success) {
        setUser(response.data);
      } else {
        toast.error(response.error || "Failed to fetch users");
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred");
      setLoading(false);
    }
  };

  const [searchkey, setSearchkey] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPrice, setFilterPrice] = useState("");

  useEffect(() => {
    getProductData();
    getOrderData();
    getUserData();
  }, []);

  return (
    <MyContext.Provider
      value={{
        mode,
        toggleMode,
        loading,
        setLoading,
        products,
        setProducts,
        addProduct,
        product,
        edithandle,
        updateProduct,
        deleteProduct,
        order,
        user,
        searchkey,
        setSearchkey,
        filterType,
        setFilterType,
        filterPrice,
        setFilterPrice,
      }}
    >
      {props.children}
    </MyContext.Provider>
  );
}

export default MyState;
