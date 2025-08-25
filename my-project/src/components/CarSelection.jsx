import { useNavigate } from "react-router-dom";
import CarModelViewer from "./ui/CarModelViewer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

const carData = [
  {
    type: "Sedan",
    modelPath: "/models/sedan/scene.gltf",
    description: "Perfect for daily drivers",
  },
  {
    type: "SUV",
    modelPath: "/models/suv/scene.gltf",
    description: "Ideal for family vehicles",
  },
  {
    type: "Coupe",
    modelPath: "/models/coupe/scene.gltf",
    description: "Luxury sports car treatment",
  },
  {
    type: "Truck",
    modelPath: "/models/truck/scene.gltf",
    description: "Heavy-duty for all terrain",
  },
];

function CarSelection() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Desktop View → Grid */}
      <div className="hidden lg:grid grid-cols-4 gap-6">
        {carData.map((car) => (
          <div
            key={car.type}
            onClick={() => navigate(`/booking/${car.type.toLowerCase()}`)}
            className="bg-black rounded-xl p-4 text-white cursor-pointer hover:ring-2 hover:ring-yellow-400 transition"
          >
            <h2 className="text-xl font-bold text-center mb-2">
              Choose {car.type}
            </h2>
            <CarModelViewer modelPath={car.modelPath} modelType={car.type} />
            <p className="mt-4 text-center text-sm text-gray-300">
              {car.description}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile & Tablet → Carousel */}
      <div className="block lg:hidden">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
          className="pb-10"
        >
          {carData.map((car) => (
            <SwiperSlide key={car.type}>
              <div
                onClick={() => navigate(`/booking/${car.type.toLowerCase()}`)}
                className="bg-black rounded-xl p-4 text-white cursor-pointer hover:ring-2 hover:ring-yellow-400 transition max-w-xs mx-auto"
              >
                <h2 className="text-lg font-bold text-center mb-2">
                  Choose {car.type}
                </h2>
                <div className="h-56">
                  <CarModelViewer modelPath={car.modelPath} modelType={car.type} />
                </div>
                <p className="mt-4 text-center text-sm text-gray-300">
                  {car.description}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default CarSelection;
