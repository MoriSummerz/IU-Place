
import React from "react";
import { CanvasProvider } from "@/context/CanvasContext";
import Header from "@/components/Header";
import CanvasGrid from "@/components/CanvasGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <CanvasProvider>
      <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
        <Header />
        <main className="flex-grow px-4 py-6 overflow-hidden">
          <div className="container mx-auto h-full">
            <CanvasGrid />
          </div>
        </main>
        <Footer />
      </div>
    </CanvasProvider>
  );
};

export default Index;
