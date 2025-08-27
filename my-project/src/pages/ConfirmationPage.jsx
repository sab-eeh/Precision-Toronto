import React from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import ProgressTracker from '../components/ProgressTracker';
// import FloatingContact from '@/components/FloatingContact';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { CheckCircle, Calendar, Clock, MapPin, Car, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';

const ConfirmationPage = ({ bookingData, onStartOver }) => {
  const handleSendSMS = () => {
    // In a real app, this would trigger SMS via Twilio
    console.log('SMS would be sent with booking details:', bookingData);
    alert('SMS confirmation sent! (Demo - would use Twilio integration)');
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      {/* <FloatingContact /> */}
      
      <div className="container mx-auto px-4 py-8">
        <ProgressTracker currentStep={4} />

        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-gold rounded-full mx-auto mb-4 flex items-center justify-center animate-glow-pulse">
              <CheckCircle className="w-10 h-10 text-background" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground text-lg">
              Your appointment has been successfully scheduled
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-card rounded-xl shadow-card p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Appointment Details</h2>
              <Badge className="bg-success text-white">Confirmed</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Information */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Service</h3>
                    <p className="text-muted-foreground">{bookingData.service.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {bookingData.service.duration} • {bookingData.carType}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Date & Time</h3>
                    <p className="text-muted-foreground">
                      {format(new Date(bookingData.date), "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">{bookingData.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-muted-foreground">{bookingData.customer.address}</p>
                    <p className="text-sm text-muted-foreground">Mobile service</p>
                  </div>
                </div>
              </div>

              {/* Customer & Vehicle Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Customer</h3>
                    <p className="text-muted-foreground">{bookingData.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{bookingData.customer.email}</p>
                    <p className="text-sm text-muted-foreground">{bookingData.customer.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Vehicle</h3>
                    <p className="text-muted-foreground">
                      {bookingData.vehicle.year} {bookingData.vehicle.make} {bookingData.vehicle.model}
                    </p>
                    {bookingData.vehicle.color && (
                      <p className="text-sm text-muted-foreground">{bookingData.vehicle.color}</p>
                    )}
                    {bookingData.vehicle.license && (
                      <p className="text-sm text-muted-foreground">Plate: {bookingData.vehicle.license}</p>
                    )}
                  </div>
                </div>

                <div className="bg-secondary/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">${bookingData.total}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Payment due at service completion</p>
                </div>
              </div>
            </div>

            {bookingData.customer.notes && (
              <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                <h3 className="font-semibold mb-2">Special Instructions</h3>
                <p className="text-muted-foreground">{bookingData.customer.notes}</p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-card rounded-xl shadow-card p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">What Happens Next?</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Confirmation SMS</p>
                  <p className="text-sm text-muted-foreground">You'll receive a text confirmation with all details</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Day Before Reminder</p>
                  <p className="text-sm text-muted-foreground">We'll send a reminder 24 hours before your appointment</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Our Team Arrives</p>
                  <p className="text-sm text-muted-foreground">Professional detailers will arrive at your location on time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleSendSMS}
              className="flex-1 bg-gradient-gold text-background hover:shadow-glow transition-all duration-300"
              size="lg"
            >
              <Phone className="w-4 h-4 mr-2" />
              Send SMS Confirmation
            </Button>
            
            <Button 
              onClick={onStartOver}
              variant="outline"
              className="flex-1 border-border hover:bg-secondary"
              size="lg"
            >
              Book Another Service
            </Button>
          </div>

          {/* Contact Information */}
          <div className="text-center mt-8 p-6 bg-secondary/20 rounded-xl">
            <h3 className="font-semibold mb-2">Need to make changes?</h3>
            <p className="text-muted-foreground mb-4">
              Contact us at least 24 hours before your appointment
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm">
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                (416) 123-4567
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                info@precisiontoronto.com
              </span>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default ConfirmationPage;
