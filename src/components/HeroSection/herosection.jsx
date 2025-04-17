import React from "react";

function HeroSection() {
  return (
    <>
      {/* Notification banner with link - increased height and font size */}
      <div className="w-full bg-gray-100 py-4 md:py-6 text-center text-gray-800 shadow-sm">
        <p className="text-base md:text-lg lg:text-xl font-medium">
          In case you're facing any difficulties with website, kindly{" "}
          <a
            href="https://freshgroce-form.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
          >
            order here
          </a>
        </p>
      </div>

      <div className="w-full overflow-hidden">
        <img
          className="w-full h-auto object-cover"
          src="/hero_sec.jpg"
          alt="Fresh Groceries"
        />
      </div>
    </>
  );
}

export default HeroSection;
