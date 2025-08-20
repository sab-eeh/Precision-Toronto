import React from "react";
import { useNavigate } from "react-router-dom";
import CarModelViewer from "../components/ui/CarModelViewer";
import ProgressTracker from "../components/ProgressTracker";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
// import FloatingContact from "@/components/FloatingContact";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { Star, MapPin, Clock, Shield } from "lucide-react";
import heroBackground from "../assets/hero-bg.jpg";

const HomePage = ({ onCarSelect }) => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Premium Protection",
      description: "Ceramic coating and paint protection",
    },
    {
      icon: Clock,
      title: "Time Efficient",
      description: "Quick turnaround without compromising quality",
    },
    {
      icon: MapPin,
      title: "Mobile Service",
      description: "We come to your location in Toronto",
    },
    {
      icon: Star,
      title: "5-Star Reviews",
      description: "Trusted by 500+ satisfied customers",
    },
  ];

  const cars = [
    {
      type: "sedan",
      label: "Sedan",
      desc: "Perfect for daily drivers",
      modelPath: "/models/sedan/scene.gltf",
    },
    {
      type: "suv",
      label: "SUV",
      desc: "Ideal for family vehicles",
      modelPath: "/models/suv/scene.gltf",
    },
    {
      type: "coupe",
      label: "Coupe",
      desc: "Luxury sports car treatment",
      modelPath: "/models/coupe/scene.gltf",
    },
    {
      type: "truck",
      label: "Truck",
      desc: "Heavy duty performance",
      modelPath: "/models/truck/scene.gltf",
    },
  ];

  const reviews = [
    {
      name: "Michael Chen",
      text: "Incredible attention to detail! My BMW looks better than when I bought it.",
      rating: 5,
    },
    {
      name: "Sarah Wilson",
      text: "Professional service and amazing results. Highly recommend Precision Toronto!",
      rating: 5,
    },
    {
      name: "David Martinez",
      text: "The ceramic coating service was worth every penny. Excellent work!",
      rating: 5,
    },
  ];

  // Handle car selection → save + navigate
  const handleCarSelect = (carType) => {
    if (onCarSelect) {
      onCarSelect(carType);
    }
    navigate("/services"); // navigate to services page
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {/* <FloatingContact /> */}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-dark opacity-60" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-slide-up leading-tight">
            <span className="text-blue-400 italic">PRECISION</span>
            <br />
            <span className="text-white italic">TORONTO</span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-300 mb-10 animate-slide-up">
            Luxury Auto Detailing Excellence
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center animate-slide-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <Icon className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-sm text-blue-300 uppercase tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Progress Tracker */}
      <ProgressTracker currentStep={1} />

      {/* Car Selection */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Choose Your Vehicle</h2>
            <p className="text-lg text-muted-foreground">
              Select your vehicle to see customized services and pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cars.map((car) => (
              <div
                key={car.type}
                className="border rounded-2xl p-5 bg-card shadow-card hover:ring-2 hover:ring-blue-400 transition-all duration-300 cursor-pointer"
                onClick={() => handleCarSelect(car.type)}
              >
                <CarModelViewer modelPath={car.modelPath} modelType={car.type} />
                <div className="text-center mt-5">
                  <h3 className="text-lg font-semibold">{car.label}</h3>
                  <p className="text-sm text-muted-foreground">{car.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <BeforeAfterSlider />
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-lg font-semibold">4.9/5 on Google</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-xl shadow-card hover:shadow-lg transition"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{review.text}"</p>
                <p className="font-semibold">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
