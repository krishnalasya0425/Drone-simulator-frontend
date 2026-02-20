import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiUsers, FiGlobe, FiClock } from "react-icons/fi";

export default function ContactUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#061E29]">
      {/* Live Animated Background */}
      <div className="fixed inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://i.pinimg.com/1200x/39/a3/35/39a3359710ee24c66c8ef1a82c47ae46.jpg)',
            opacity: 0.25,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#00C2C7]/10 via-transparent to-[#0a2533]/80 animate-gradient-slow" />
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#5F9598] hover:text-[#00C2C7] transition-colors mb-6 group"
          >
            <FiArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Back</span>
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D546D] to-[#5F9598] flex items-center justify-center shadow-lg">
              <FiUsers className="text-[#F3F4F4]" size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[#F3F4F4]">Contact Us</h1>
              <p className="text-[#5F9598] font-medium mt-1">Get in touch with our support team</p>
            </div>
          </div>

          {/* Main Contact Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Company Info Card */}
            <div className="lg:col-span-1">
              <div className="content-card h-full">
                <h2 className="text-xl font-bold text-[#F3F4F4] mb-6 pb-2 border-b border-[#5F9598]/30">
                  Company Information
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#1D546D]/30 flex items-center justify-center flex-shrink-0">
                      <FiGlobe className="text-[#5F9598]" size={20} />
                    </div>
                    <div>
                      <h3 className="text-[#5F9598] font-bold text-sm mb-1">Company Name</h3>
                      <p className="text-[#F3F4F4] font-medium">Edgeforce Solutions Pvt. Ltd.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#1D546D]/30 flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="text-[#5F9598]" size={20} />
                    </div>
                    <div>
                      <h3 className="text-[#5F9598] font-bold text-sm mb-1">Address</h3>
                      <p className="text-[#F3F4F4] font-medium leading-relaxed">
                        5th floor, Loukya Heights,1-55/12/M/1-A-5-B<br />
                        Kondapur Main Road, Masjid Banda,<br />
                        Gautami Enclave, Kondapur, Telangana - 500084<br />
                        India
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#1D546D]/30 flex items-center justify-center flex-shrink-0">
                      <FiMail className="text-[#5F9598]" size={20} />
                    </div>
                    <div>
                      
                     <a 
                    href="mailto:dbshcbsh@gmail.com" 
                    className="text-xl  text-[#00C2C7] hover:text-[#F3F4F4] transition-colors bg-[#061E29]/50 px-6 py-3 rounded-xl "
                  >
                    edgexr@edgeforce.in
                  </a>
                    </div>
                  </div>

                 
                </div>
              </div>
            </div>

            {/* Contact Persons Cards */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* IT & Technical Issues */}
                <div className="content-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D546D] to-[#5F9598] flex items-center justify-center">
                      <span className="text-2xl">🔧</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#F3F4F4]">IT & Technical Issues</h2>
                  </div>
                  
                  <div className="bg-[#1D546D]/20 rounded-xl p-5 border border-[#5F9598]/30">
                    <p className="text-[#F3F4F4] font-bold text-lg mb-1">Shubham Raj</p>
                    <p className="text-[#5F9598] text-sm mb-3">IT</p>
                    
                    <div className="flex items-center gap-3 text-[#F3F4F4] mb-2">
                      <FiPhone size={16} className="text-[#5F9598]" />
                      <span>+91 90654 06899</span>
                    </div>
                    
                    
                  </div>
                </div>

                {/* Software Related Issues */}
                <div className="content-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D546D] to-[#5F9598] flex items-center justify-center">
                      <span className="text-2xl">💻</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#F3F4F4]">Software Related Issues</h2>
                  </div>
                  
                  <div className="bg-[#1D546D]/20 rounded-xl p-5 border border-[#5F9598]/30">
                    <p className="text-[#F3F4F4] font-bold text-lg mb-1">Kiran Kumar Reddy</p>
                    <p className="text-[#5F9598] text-sm mb-3">XR Technical Head</p>
                    
                    <div className="flex items-center gap-3 text-[#F3F4F4] mb-2">
                      <FiPhone size={16} className="text-[#5F9598]" />
                      <span>+91 93242 11205</span>
                    </div>
                    
                    
                  </div>
                </div>

                {/* Business Related Issues - Full Width */}
                <div className="md:col-span-2">
                  <div className="content-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D546D] to-[#5F9598] flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                      <h2 className="text-lg font-bold text-[#F3F4F4]">Business Related Issues</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#1D546D]/20 rounded-xl p-5 border border-[#5F9598]/30">
                        <p className="text-[#F3F4F4] font-bold text-lg mb-1">Suraj Pratap Singh</p>
                        <p className="text-[#5F9598] text-sm mb-3">Business Head</p>
                        
                        <div className="flex items-center gap-3 text-[#F3F4F4] mb-2">
                          <FiPhone size={16} className="text-[#5F9598]" />
                          <span>+91 90327 90695</span>
                        </div>
                        
                       
                      </div>

                      <div className="bg-[#1D546D]/20 rounded-xl p-5 border border-[#5F9598]/30">
                        <p className="text-[#F3F4F4] font-bold text-lg mb-1">Rajath</p>
                        <p className="text-[#5F9598] text-sm mb-3">Business Development Associate</p>
                        
                        <div className="flex items-center gap-3 text-[#F3F4F4] mb-2">
                          <FiPhone size={16} className="text-[#5F9598]" />
                          <span>+91 70127 11019</span>
                        </div>
                      
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email and Support Card */}
      
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .content-card {
          background: rgba(10, 37, 51, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 194, 199, 0.2);
          border-radius: 24px;
          padding: 1.5rem;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
        }

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 194, 199, 0.15), transparent);
          filter: blur(50px);
          animation: float-orb 20s infinite ease-in-out;
          pointer-events: none;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          top: -10%;
          left: -10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          top: 70%;
          right: -5%;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 450px;
          height: 450px;
          bottom: -5%;
          left: 40%;
          animation-delay: 14s;
        }

        @keyframes float-orb {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          33% {
            transform: translate(50px, -50px) scale(1.1);
            opacity: 0.4;
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
            opacity: 0.3;
          }
        }

        @keyframes gradient-slow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 15s ease infinite;
        }
      `}</style>
    </div>
  );
}