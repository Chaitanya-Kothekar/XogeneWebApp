// src/pages/Home.jsx
import React from "react";
import SearchBar from "../components/SearchBar";
import Header from "../components/Header";

const Home = () => {
  return (
    <>
      <Header />
      <div className="flex justify-center items-center h-[80vh] mt-[-12vh] shadow-md ">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">Drug Search</h1>
          <SearchBar />
        </div>
      </div>
    </>
  );
};

export default Home;
