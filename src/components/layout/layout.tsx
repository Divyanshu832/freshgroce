import React from 'react'
import Footer from '../footer/footer'
import Navbar from '../navbar/navbar'

function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <div className="content">
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default Layout