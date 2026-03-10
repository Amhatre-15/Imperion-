import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ text: string, sender: 'bot' | 'user' }[]>([
    { text: "Greetings. I am the Imperion Consigliere. How may I assist you in your pursuit of excellence today?", sender: 'bot' }
  ]);
  
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    // Scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Intersection Observer
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Particles
    const canvas = particlesCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const resizeCanvas = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const particlesArr: any[] = [];
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
          particlesArr.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.5,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.5 + 0.2
          });
        }

        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          particlesArr.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201, 168, 76, ${p.alpha})`;
            ctx.fill();
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
          });
          requestAnimationFrame(animate);
        };
        animate();
      }
    }

    // Cursor logic
    const dot = document.querySelector('.cursor-dot') as HTMLElement;
    const circle = document.querySelector('.cursor-circle') as HTMLElement;
    const handleMouseMove = (e: MouseEvent) => {
      if (dot && circle) {
        dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        circle.animate({
          transform: `translate(${e.clientX}px, ${e.clientY}px)`
        }, { duration: 150, fill: 'forwards' });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Gemini Init
    const initGemini = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        chatSessionRef.current = ai.chats.create({
          model: "gemini-3-flash-preview",
          config: {
            systemInstruction: "You are 'The Imperion Consigliere', the refined, authoritative, and highly sophisticated AI assistant for IMPERION, an ultra-premium menswear maison. Your tone is masculine, stoic, and helpful. You speak with the weight of tradition and the precision of a master tailor. You assist customers with style advice, fitting inquiries, and brand heritage. You represent royalty and old-money power. Keep responses concise but evocative.",
          },
        });
      } catch (e) {
        console.error("Gemini initialization failed", e);
      }
    };
    initGemini();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setChatInput('');

    if (!chatSessionRef.current) {
      setMessages(prev => [...prev, { text: "My apologies, I am currently indisposed. Please try again in a moment.", sender: 'bot' }]);
      return;
    }

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { text: result.text, sender: 'bot' }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { text: "My apologies, there was a disturbance in the connection. Please try again.", sender: 'bot' }]);
    }
  };

  return (
    <div className="interactive-hover">
      <div className="cursor-dot"></div>
      <div className="cursor-circle"></div>

      <nav id="navbar" className={isScrolled ? 'scrolled' : ''}>
        <a href="#" className="nav-logo interactive">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 19h20v2H2v-2zm10-16l5 7h-3v6h-4v-6H7l5-7z"/>
          </svg>
          <span>Imperion</span>
        </a>
        <div className="nav-links">
          <a href="#hero" className="interactive">Maison</a>
          <a href="#collection" className="interactive">Collection</a>
          <a href="#atelier" className="interactive">Atelier</a>
          <a href="#heritage" className="interactive">Heritage</a>
          <a href="#contact" className="interactive">Contact</a>
        </div>
        <button className="btn-outline interactive">Book a Fitting</button>
      </nav>

      <header id="hero">
        <canvas id="particles" ref={particlesCanvasRef}></canvas>
        <div className="hero-content reveal">
          <div className="hero-line1">The Art Of</div>
          <h1 className="hero-line2">MASCULINE REIGN.</h1>
          <p className="hero-subtitle">For the man who needs no introduction.</p>
          <div className="hero-actions">
            <button className="btn-filled interactive" onClick={() => document.getElementById('collection')?.scrollIntoView()}>Explore the Collection</button>
            <button className="btn-outline interactive" onClick={() => document.getElementById('heritage')?.scrollIntoView()}>Our Heritage</button>
          </div>
        </div>
        <div className="scroll-indicator">
          <span className="scroll-text">Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </header>

      <div className="marquee-wrapper">
        <div className="marquee-content">
          <span className="marquee-text">IMPERION · EST. MMXII · HANDCRAFTED EXCELLENCE · LONDON · MILAN · DUBAI · NEW YORK · IMPERION · WORN BY FEW · </span>
          <span className="marquee-text">IMPERION · EST. MMXII · HANDCRAFTED EXCELLENCE · LONDON · MILAN · DUBAI · NEW YORK · IMPERION · WORN BY FEW · </span>
        </div>
      </div>

      <section id="collection">
        <div className="section-header reveal">
          <h2 className="section-title">The Crown Collection</h2>
          <p className="section-subtitle">A symphony of Italian wool, hand-stitched lapels, and imperial silhouette.</p>
        </div>
        <div className="grid-3">
          <div className="product-card reveal interactive">
            <div className="product-img">
              <img src="https://images.unsplash.com/photo-1594938291221-94f18cbb5660?q=80&w=600&h=800&auto=format&fit=crop" alt="The Sovereign Coat" referrerPolicy="no-referrer" />
              <span className="product-label">CASHMERE & SILK</span>
            </div>
            <div className="product-info">
              <h3 className="product-name">The Sovereign Coat</h3>
              <p className="product-desc">Midnight wool tailored for absolute command.</p>
              <p className="product-price">₹ 3,25,000</p>
              <button className="btn-acquire interactive">Acquire</button>
            </div>
          </div>
          <div className="product-card reveal interactive" style={{ transitionDelay: '0.2s' }}>
            <div className="product-img">
              <img src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=600&h=800&auto=format&fit=crop" alt="The Obsidian Suit" referrerPolicy="no-referrer" />
              <span className="product-label">SUPER 180S WOOL</span>
            </div>
            <div className="product-info">
              <h3 className="product-name">The Obsidian Suit</h3>
              <p className="product-desc">Flawless drape. Unforgiving precision.</p>
              <p className="product-price">₹ 4,50,000</p>
              <button className="btn-acquire interactive">Acquire</button>
            </div>
          </div>
          <div className="product-card reveal interactive" style={{ transitionDelay: '0.4s' }}>
            <div className="product-img">
              <img src="https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=600&h=800&auto=format&fit=crop" alt="The Emperor Blazer" referrerPolicy="no-referrer" />
              <span className="product-label">VELVET & SATIN</span>
            </div>
            <div className="product-info">
              <h3 className="product-name">The Emperor Blazer</h3>
              <p className="product-desc">For evenings that dictate history.</p>
              <p className="product-price">₹ 2,85,000</p>
              <button className="btn-acquire interactive">Acquire</button>
            </div>
          </div>
        </div>
      </section>

      <section id="shoes">
        <div className="shoes-left reveal">
          <div className="shoes-vertical">IMPERION FOOTWEAR</div>
          <div className="shoes-copy">
            <h2>Forged for Conquest</h2>
            <p>Every oxford. Every loafer. Every boot. Crafted from single-cut Florentine leather, finished by hand over three days by our master cordwainers in Naples. Walk with the weight of an empire.</p>
          </div>
        </div>
        <div className="shoes-right">
          <div className="shoe-card reveal interactive">
            <div className="shoe-img">
              <img src="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=600&h=600&auto=format&fit=crop" alt="The Caesar Oxford" referrerPolicy="no-referrer" />
              <span className="product-label">CALFSKIN</span>
            </div>
            <h4 className="shoe-name">The Caesar Oxford</h4>
          </div>
          <div className="shoe-card reveal interactive" style={{ transitionDelay: '0.2s' }}>
            <div className="shoe-img">
              <img src="https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=600&h=600&auto=format&fit=crop" alt="The Milan Loafer" referrerPolicy="no-referrer" />
              <span className="product-label">SUEDE</span>
            </div>
            <h4 className="shoe-name">The Milan Loafer</h4>
          </div>
          <div className="shoe-card reveal interactive" style={{ transitionDelay: '0.4s' }}>
            <div className="shoe-img">
              <img src="https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600&h=600&auto=format&fit=crop" alt="The Conquest Boot" referrerPolicy="no-referrer" />
              <span className="product-label">CORDOVAN</span>
            </div>
            <h4 className="shoe-name">The Conquest Boot</h4>
          </div>
          <div className="shoe-card reveal interactive" style={{ transitionDelay: '0.6s' }}>
            <div className="shoe-img">
              <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&h=600&auto=format&fit=crop" alt="The Nocturne Derby" referrerPolicy="no-referrer" />
              <span className="product-label">PATENT</span>
            </div>
            <h4 className="shoe-name">The Nocturne Derby</h4>
          </div>
        </div>
      </section>

      <section id="heritage">
        <div className="section-header reveal">
          <h2 className="section-title">Our Heritage</h2>
          <p className="section-subtitle">A decade of defining power.</p>
        </div>
        <div className="timeline">
          <div className="timeline-node reveal">
            <div className="timeline-img">
              <img src="https://picsum.photos/seed/london2012/200/200" alt="London 2012" referrerPolicy="no-referrer" />
            </div>
            <div className="year">2012</div>
            <div className="event">IMPERION Founded in Mayfair, London. The first bespoke atelier opens its doors to a select clientele.</div>
          </div>
          <div className="timeline-node reveal">
            <div className="timeline-img">
              <img src="https://picsum.photos/seed/royal2015/200/200" alt="Royal Appointment" referrerPolicy="no-referrer" />
            </div>
            <div className="year">2015</div>
            <div className="event">First Royal Appointment awarded. The brand becomes synonymous with aristocratic elegance.</div>
          </div>
          <div className="timeline-node reveal">
            <div className="timeline-img">
              <img src="https://picsum.photos/seed/milan2018/200/200" alt="Milan 2018" referrerPolicy="no-referrer" />
            </div>
            <div className="year">2018</div>
            <div className="event">Milan Atelier Opens. Italian craftsmanship is seamlessly integrated into British tailoring.</div>
          </div>
          <div className="timeline-node reveal">
            <div className="timeline-img">
              <img src="https://picsum.photos/seed/dubai2021/200/200" alt="Dubai 2021" referrerPolicy="no-referrer" />
            </div>
            <div className="year">2021</div>
            <div className="event">Dubai Flagship launches. The Palace Collection debuts, setting records in luxury menswear.</div>
          </div>
          <div className="timeline-node reveal">
            <div className="timeline-img">
              <img src="https://picsum.photos/seed/global2024/200/200" alt="Global 2024" referrerPolicy="no-referrer" />
            </div>
            <div className="year">2024</div>
            <div className="event">IMPERION named #1 Power Dressing Brand globally by The Sartorial Index.</div>
          </div>
        </div>
      </section>

      <section className="statement-banner reveal">
        <h2 className="statement-quote">"A king does not dress for the crowd."</h2>
        <p className="statement-author">— IMPERION MAISON, London</p>
      </section>

      <section id="atelier">
        <div className="atelier-grid">
          <div className="service-col reveal">
            <h3 className="service-title">Bespoke Tailoring</h3>
            <p className="service-desc">From first measure to final stitch: 6 weeks, zero compromise. A garment sculpted exclusively for your anatomy.</p>
          </div>
          <div className="service-col reveal" style={{ transitionDelay: '0.2s' }}>
            <h3 className="service-title">Private Consultation</h3>
            <p className="service-desc">Your wardrobe curated by our senior style director. Available at your residence or our private suites.</p>
          </div>
          <div className="service-col reveal" style={{ transitionDelay: '0.4s' }}>
            <h3 className="service-title">Monogram Service</h3>
            <p className="service-desc">Your initials, pressed in gold, on every garment. The ultimate signature of ownership.</p>
          </div>
        </div>
      </section>

      <section id="contact">
        <h2 className="newsletter-title reveal">Enter the Inner Circle</h2>
        <div className="form-group reveal">
          <input type="email" placeholder="Your email address" className="interactive" />
          <button className="interactive">JOIN</button>
        </div>
        <div className="social-links reveal">
          <a href="#" className="interactive">Instagram</a>
          <a href="#" className="interactive">X / Twitter</a>
          <a href="#" className="interactive">Pinterest</a>
        </div>
      </section>

      <footer>
        <div id="chat-widget">
          <button id="chat-toggle" className="interactive" onClick={() => setIsChatOpen(!isChatOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <div id="chat-window" className={isChatOpen ? 'open' : ''}>
            <div className="chat-header">
              <h3>The Consigliere</h3>
              <button id="chat-close" onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="chat-messages" ref={chatMessagesRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.sender}`}>{msg.text}</div>
              ))}
            </div>
            <form className="chat-input-area" id="chat-form" onSubmit={handleChatSubmit}>
              <input 
                type="text" 
                id="chat-input" 
                placeholder="Speak your mind..." 
                autoComplete="off" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className="footer-top">
          <div className="footer-brand">
            <h3>IMPERION</h3>
            <p>Worn by Few. Remembered by All.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Maison</h4>
              <ul>
                <li><a href="#" className="interactive">About Us</a></li>
                <li><a href="#" className="interactive">Atelier</a></li>
                <li><a href="#" className="interactive">Careers</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Client Services</h4>
              <ul>
                <li><a href="#" className="interactive">Book an Appointment</a></li>
                <li><a href="#" className="interactive">Shipping & Returns</a></li>
                <li><a href="#" className="interactive">Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#" className="interactive">Privacy Policy</a></li>
                <li><a href="#" className="interactive">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2025 IMPERION MAISON LTD. ALL RIGHTS RESERVED. LONDON.
        </div>
      </footer>
    </div>
  );
};

export default App;
