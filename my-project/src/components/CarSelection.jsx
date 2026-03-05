import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CarModelViewer from "./ui/CarModelViewer";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* ---------------- Car Data ---------------- */

const CAR_DATA = Object.freeze([
  {
    id: "coupe",
    type: "Coupe",
    modelPath: "/models/coupe/scene-final.glb",
    description: "Luxury sports car treatment",
  },
  {
    id: "sedan",
    type: "Sedan",
    modelPath: "/models/sedan/scene-final.glb",
    description: "Perfect for daily drivers",
  },
  {
    id: "suv1",
    type: "SUV",
    modelPath: "/models/suv1/scene-final.glb",
    description: "Ideal for family vehicles",
  },
  {
    id: "suv2",
    type: "SUV",
    modelPath: "/models/suv2/scene-final.glb",
    description: "Ideal for family vehicles",
  },
  {
    id: "truck",
    type: "Truck",
    modelPath: "/models/truck/scene-final.glb",
    description: "Heavy-duty for all terrain",
  },
]);

/* ---------------- Card ---------------- */

const CarCard = React.memo(function CarCard({ car, onSelect }) {
  return (
    <div
      onClick={() => onSelect(car.id)}
      className="bg-black rounded-xl p-4 text-white cursor-pointer hover:ring-2 hover:ring-yellow-400 transition"
    >
      <h2 className="text-xl font-bold text-center mb-2">Choose {car.type}</h2>

      <CarModelViewer modelPath={car.modelPath} modelType={car.type} />

      <p className="mt-4 text-center text-sm text-gray-300">
        {car.description}
      </p>
    </div>
  );
});

/* ---------------- Main Component ---------------- */

function CarSelection() {
  const navigate = useNavigate();

  const cars = useMemo(() => CAR_DATA, []);

  const handleSelect = useCallback(
    (type) => {
      navigate(`/booking/${type}`);
    },
    [navigate]
  );

  return (
    <div>
      {/* ---------------- Desktop Grid ---------------- */}

      <div className="hidden lg:grid grid-cols-4 gap-6">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} onSelect={handleSelect} />
        ))}
      </div>

      {/* ---------------- Mobile / Tablet Carousel ---------------- */}

      <div className="block lg:hidden">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
          watchSlidesProgress
          updateOnWindowResize
          className="pb-10"
        >
          {cars.map((car) => (
            <SwiperSlide key={car.id}>
              <div className="max-w-xs mx-auto">
                <CarCard car={car} onSelect={handleSelect} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default React.memo(CarSelection);
