import React from 'react';
import { 
  Brain, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  ShieldCheck, 
  MessageCircle, 
  PhoneCall, 
  Mail, 
  FileText 
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1: Resources */}
          <div className="footer-col">
            <h4 className="col-title">Resources</h4>
            <ul className="col-links">
              <li><a href="#"><FileText size={16} /> Mental Health Articles</a></li>
              <li><a href="#"><MessageCircle size={16} /> Breathwork Guides</a></li>
              <li><a href="#"><PhoneCall size={16} /> Emergency Contacts</a></li>
            </ul>
          </div>

          {/* Column 2: Support */}
          <div className="footer-col">
            <h4 className="col-title">Support</h4>
            <ul className="col-links">
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Counseling Services</a></li>
              <li><a href="mailto:studentcare.support@gmail.com"><Mail size={16} /> studentcare.support@gmail.com</a></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="footer-col">
            <h4 className="col-title">Legal</h4>
            <ul className="col-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#"><ShieldCheck size={16} /> HIPAA Compliance</a></li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="footer-col">
            <h4 className="col-title">Connect</h4>
            <div className="social-icons">
              <a href="#" className="social-link"><Twitter size={20} /></a>
              <a href="#" className="social-link"><Facebook size={20} /></a>
              <a href="#" className="social-link"><Instagram size={20} /></a>
              <a href="#" className="social-link"><Linkedin size={20} /></a>
            </div>
            <div className="newsletter-box">
              <p>Stay updated with our newsletter</p>
              <div className="input-group-tiny">
                <input type="email" placeholder="Your email" />
                <button type="submit">Join</button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="bottom-content">
            <div className="footer-brand">
              <Brain size={24} className="small-brain-icon" />
              <span className="footer-brand-name">STUDENT CARE AI</span>
            </div>
            <p className="copyright">&copy; {new Date().getFullYear()} Student Care AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
