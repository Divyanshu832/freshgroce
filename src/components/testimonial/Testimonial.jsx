import React, { useContext } from "react";
import myContext from "../../context/data/myContext";

function Testimonial() {
  const context = useContext(myContext);
  const { mode } = context;
  return (
    <div>
      <section
        className="text-gray-600 body-font"
        style={{
          backgroundColor: mode === "dark" ? "#1e293b" : "#f0fdf4", // Dark blue-gray in dark mode, light green in light mode
          color: mode === "dark" ? "#e2e8f0" : "inherit",
        }}
      >
        <div className="container px-5 py-10 mx-auto">
          <div className="w-full mb-6 lg:mb-10 flex flex-col items-center text-center">
            <h1
              className="sm:text-3xl text-2xl font-medium title-font mb-2"
              style={{ color: mode === "dark" ? "white" : "#1f2937" }}
            >
              Testimonials
            </h1>
            <div className="h-1 w-48 bg-green-600 rounded"></div>
          </div>
          <h2
            className="text-center text-2xl font-semibold mb-10"
            style={{ color: mode === "dark" ? "white" : "#1f2937" }}
          >
            What our <span className=" text-green-500">customers</span> are
            saying
          </h2>
          <div className="flex flex-wrap -m-4">
            <div className="lg:w-1/3 lg:mb-0 mb-6 p-4">
              <div className="h-full text-center">
                <img
                  alt="testimonial"
                  className="w-20 h-20 mb-8 object-cover object-center rounded-full inline-block border-2 border-gray-200 bg-gray-100"
                  src="https://images.unsplash.com/photo-1648577735298-385ccb9755c0?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
                <p
                  style={{ color: mode === "dark" ? "white" : "" }}
                  className="leading-relaxed"
                >
                  "As a student living in a hostel, getting fresh vegetables was
                  a nightmare—until I found this service! The veggies are always
                  fresh, delivery is on time, and prices are student-friendly.
                  Highly recommend it to anyone staying away from home!"
                </p>
                <span className="inline-block h-1 w-10 rounded bg-green-500 mt-6 mb-4" />
                <h2
                  style={{ color: mode === "dark" ? "#ff4162" : "" }}
                  className="text-gray-900 font-medium title-font tracking-wider text-sm uppercase"
                >
                  Rohit Jadhav
                </h2>
                <p
                  style={{ color: mode === "dark" ? "white" : "" }}
                  className="text-gray-500"
                >
                  Student
                </p>
              </div>
            </div>
            <div className="lg:w-1/3 lg:mb-0 mb-6 p-4">
              <div className="h-full text-center">
                <img
                  alt="testimonial"
                  className="w-20 h-20 mb-8 object-cover object-center rounded-full inline-block border-2 border-gray-200 bg-gray-100"
                  src="https://plus.unsplash.com/premium_photo-1682089841647-458dd29dc0ee?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
                <p
                  style={{ color: mode === "dark" ? "white" : "" }}
                  className="leading-relaxed"
                >
                  We run a mess that serves over 200 people daily, and freshness
                  is non-negotiable. Ever since we partnered with this veggie
                  delivery service, our quality has gone up and wastage has gone
                  down. It's a game changer!
                </p>
                <span className="inline-block h-1 w-10 rounded bg-green-500 mt-6 mb-4" />
                <h2
                  style={{ color: mode === "dark" ? "#ff4162" : "" }}
                  className="text-gray-900 font-medium title-font tracking-wider text-sm uppercase"
                >
                  Mrs. Shalini Verma
                </h2>
                <p
                  style={{ color: mode === "dark" ? "white" : "" }}
                  className="text-gray-500"
                >
                  Manager, Annapurna Mess
                </p>
              </div>
            </div>
            <div className="lg:w-1/3 lg:mb-0 p-4">
              <div className="h-full text-center">
                <img
                  alt="testimonial"
                  className="w-20 h-20 mb-8 object-cover object-center rounded-full inline-block border-2 border-gray-200 bg-gray-100"
                  src="https://images.unsplash.com/photo-1547212371-eb5e6a4b590c?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
                <p
                  style={{ color: mode === "dark" ? "white" : "" }}
                  className="leading-relaxed"
                >
                  "I'm a working mom and don't always have time to go vegetable
                  shopping. This website has made my life so much easier. Fresh
                  products delivered right to my doorstep and that too at such a
                  low price — can't ask for more!"
                </p>
                <span className="inline-block h-1 w-10 rounded bg-green-500 mt-6 mb-4" />
                <h2
                  style={{ color: mode === "dark" ? "#ff4162" : "" }}
                  className="text-gray-900 font-medium title-font tracking-wider text-sm uppercase"
                >
                  Neha Kulkarni
                </h2>
                <p
                  style={{ color: mode === "dark" ? "white" : "" }}
                  className="text-gray-500"
                >
                  Bhopal Resident
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Testimonial;
