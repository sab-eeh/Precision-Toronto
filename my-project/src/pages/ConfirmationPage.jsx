import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import ProgressTracker from "../components/ProgressTracker";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { CheckCircle, Calendar, MapPin, Car, Mail } from "lucide-react";
import { format } from "date-fns";

export default function ConfirmationPage() {
  const { state: bookingData } = useLocation();
  const navigate = useNavigate();

  if (!bookingData) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-hero text-white p-10">
        <div className="p-8 rounded-xl border border-border bg-card text-center w-full max-w-xl">
          No booking data found.
          <Button className="mt-4" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero text-white">
      <Header />
      <ProgressTracker currentStep={4} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full border border-border mx-auto mb-4 flex items-center justify-center bg-primary/20">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground text-lg">
              Your appointment has been successfully scheduled
            </p>
          </div>

          {/* Booking Details */}
          <div className="bg-card rounded-xl border border-border p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Appointment Details</h2>
              <Badge className="bg-success text-white">Confirmed</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Services</h3>
                    <p className="text-muted-foreground">
                      {bookingData.services.map((s) => s.title).join(", ")}
                    </p>
                    {bookingData.addons?.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Add-ons:{" "}
                        {bookingData.addons.map((a) => a.title).join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Date & Time</h3>
                    <p className="text-muted-foreground">
                      {format(new Date(bookingData.date), "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bookingData.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-muted-foreground">
                      {bookingData.customer.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mobile service
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Customer</h3>
                    <p className="text-muted-foreground">
                      {bookingData.customer.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bookingData.customer.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bookingData.customer.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Vehicle</h3>
                    <p className="text-muted-foreground">
                      {bookingData.vehicle.year} {bookingData.vehicle.make}{" "}
                      {bookingData.vehicle.model}
                    </p>
                    {bookingData.vehicle.color && (
                      <p className="text-sm text-muted-foreground">
                        {bookingData.vehicle.color}
                      </p>
                    )}
                    {bookingData.vehicle.license && (
                      <p className="text-sm text-muted-foreground">
                        Plate: {bookingData.vehicle.license}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border border-border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">
                      ${bookingData.total}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Payment due at service completion
                  </p>
                </div>
              </div>
            </div>

            {bookingData.customer.notes && (
              <div className="mt-6 p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">Special Instructions</h3>
                <p className="text-muted-foreground">
                  {bookingData.customer.notes}
                </p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">What Happens Next?</h3>
            <p className="text-muted-foreground">
              A technician will contact you on the provided phone number to
              confirm your appointment and arrival time.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => navigate("/")}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
