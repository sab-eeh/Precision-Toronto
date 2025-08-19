import React from 'react';
import { Phone, Mail, MapPin, Instagram, MessageCircle, Clock, Shield, Award, Users } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-16">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">
              <span className="text-blue-400 bg-clip-text text-transparent">Precision</span>
              <span className="text-foreground ml-2">Toronto</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Premier luxury auto detailing services in the Greater Toronto Area. 
              We bring professional-grade care directly to your location.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/precisiontoronto"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-background transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/14161234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-background transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Basic Wash & Dry</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Full Detail Package</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Ceramic Coating</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Interior Deep Clean</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Paint Correction</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mobile Service</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>(416) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>info@precisiontoronto.com</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>
                  Greater Toronto Area<br />Mobile Service Available
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>
                  Mon-Sat: 8AM-6PM<br />Sunday: By Appointment
                </span>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Why Choose Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Fully Insured & Bonded</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Award className="w-4 h-4 text-blue-400" />
                <span>5-Star Google Reviews</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="w-4 h-4 text-blue-400" />
                <span>500+ Satisfied Customers</span>
              </div>
              <div className="bg-secondary/20 p-3 rounded-lg">
                <div className="text-blue-400 font-semibold">Satisfaction Guarantee</div>
                <div className="text-xs text-muted-foreground mt-1">
                  100% satisfaction or we'll make it right
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-6">
              <span>© 2024 Precision Toronto. All rights reserved.</span>
              <a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
            <div className="flex items-center gap-4">
              <span>Licensed Auto Detailing Service</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Serving Toronto Since 2020</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
