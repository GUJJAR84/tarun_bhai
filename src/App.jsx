import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThreeScene from './components/ThreeScene';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [started, setStarted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: '--', hours: '--', mins: '--', secs: '--' });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const mainRef = useRef(null);

  // Mouse Parallax
  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Countdown
  useEffect(() => {
    const weddingDate = new Date('2026-03-11T16:00:00+05:30').getTime();
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = weddingDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: '🎉', hours: '🎉', mins: '🎉', secs: '🎉' });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        mins: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        secs: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0'),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    setStarted(true);
  };

  // GSAP Animations
  useGSAP(() => {
    if (!started) return;

    ScrollTrigger.create({
      trigger: '.scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => setScrollProgress(self.progress)
    });

    // Scene 1
    gsap.fromTo('#ganesha-wrap', { opacity: 0, scale: 0.85, y: 30 }, { opacity: 1, scale: 1, y: 0, scrollTrigger: { trigger: '#scene-opening', start: 'top 80%', end: 'center 60%', scrub: 1.5 } });

    // Scene 2
    gsap.fromTo('#invite-card', { opacity: 0, y: 50 }, { opacity: 1, y: 0, scrollTrigger: { trigger: '#scene-announcement', start: 'top 70%', end: 'center 50%', scrub: 1.5 } });

    // Scene 3
    gsap.fromTo('#couple-heading', { opacity: 0, y: -25 }, { opacity: 1, y: 0, scrollTrigger: { trigger: '#scene-couple', start: 'top 75%', end: 'top 50%', scrub: 1 } });
    gsap.fromTo('#couple-row', { opacity: 0, scale: 0.75 }, { opacity: 1, scale: 1, scrollTrigger: { trigger: '#scene-couple', start: 'top 65%', end: 'center 50%', scrub: 1.5 } });

    // Scene 4 - Events
    gsap.fromTo('#events-head', { opacity: 0, y: -35 }, { opacity: 1, y: 0, duration: 0.8, scrollTrigger: { trigger: '#scene-events', start: 'top 80%', toggleActions: 'play none none reverse' } });
    gsap.utils.toArray('.event-card').forEach((card, i) => {
      gsap.fromTo(card, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8, delay: i * 0.12, ease: 'back.out(1.2)', scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' } });
    });

    // Countdown
    gsap.fromTo('#countdown-wrap', { opacity: 0, y: 30 }, { opacity: 1, y: 0, scrollTrigger: { trigger: '#scene-countdown', start: 'top 70%', end: 'center 55%', scrub: 1.5 } });

    // Mandap
    gsap.fromTo('#mandap-wrap', { opacity: 0, y: 40 }, { opacity: 1, y: 0, scrollTrigger: { trigger: '#scene-mandap', start: 'top 60%', end: 'center center', scrub: 1.5 } });

    // Family
    gsap.fromTo('#family-wrap', { opacity: 0, y: 50 }, { opacity: 1, y: 0, scrollTrigger: { trigger: '#scene-family', start: 'top 65%', end: 'center center', scrub: 1.5 } });

    // Blessing
    gsap.fromTo('#blessing-wrap', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, scrollTrigger: { trigger: '#scene-blessing', start: 'top 60%', end: 'center center', scrub: 1.5 } });

  }, [started]);

  return (
    <main ref={mainRef}>
      <ThreeScene scrollProgress={scrollProgress} animationStarted={started} mousePos={mousePos} />

      {/* Loading Screen */}
      {!started && (
        <div className="loading-screen" id="loading-screen" style={{ opacity: started ? 0 : 1, transition: 'opacity 1.2s ease' }}>
          <div className="loading-om">ॐ</div>
          <div className="loading-sanskrit">|| श्री गणेशाय नमः ||</div>
          <div className="loading-names">Tarun & Nidhi</div>
          <div className="loading-tagline">request the honour of your presence</div>
          <button className="enter-btn" onClick={handleStart}>Open Invitation</button>
        </div>
      )}

      {/* Persistent UI elements */}

      <a href="#rsvp-section" className="rsvp-float">RSVP ✉</a>

      {/* Content wrapper */}
      <div className="scroll-container" id="scroll-container">

        {/* 1. GANESHA */}
        <section className="section" id="scene-opening">
          <div className="ganesha-wrap" id="ganesha-wrap">
            <img src={`${import.meta.env.BASE_URL}assets/ganesha.png`} alt="श्री गणेश" className="ganesha-img" />
            <div className="shubh-vivah-text">शुभ विवाह</div>
            <div class="shubh-vivah-en">Auspicious Wedding</div>
            <div className="ornament"><span className="ornament-icon">✦</span></div>
            <div className="ganesh-mantra">|| श्री गणेशाय नमः ||</div>
          </div>
        </section>

        {/* 2. ANNOUNCEMENT */}
        <section className="section" id="scene-announcement">
          <div className="invite-card" id="invite-card">
            <div className="ornament"><span className="ornament-icon">❀</span></div>
            <div className="invite-date-hindi">बुधवार, दिनांक 11 मार्च 2026</div>
            <div className="invite-date-en">Wednesday, 11th March 2026</div>
            <div className="ornament"><span className="ornament-icon">◆</span></div>

            <p className="invite-families">Together with their families</p>
            <p className="invite-families-hindi">अपने परिवारों के साथ</p>

            <div className="ornament-heavy"><span className="ornament-icon">❦</span></div>

            <h1 className="invite-names">Tarun <span className="invite-ampersand">&</span> Nidhi</h1>
            <div className="invite-names-hindi">चि॰ तरुण  ❦  आयु॰ निधि</div>

            <div className="ornament-heavy"><span className="ornament-icon">❦</span></div>

            <p className="invite-subtitle">
              Cordially invite you to celebrate<br />their sacred union in holy matrimony
            </p>
            <div className="ornament"><span className="ornament-icon">❀</span></div>
          </div>
        </section>

        {/* 3. COUPLE */}
        <section className="section" id="scene-couple">
          <div className="couple-heading" id="couple-heading">
            <div className="couple-heading-en">Two Souls, One Journey</div>
            <div className="couple-heading-hi">दो आत्माएं, एक सफ़र</div>
          </div>
          <div className="couple-row" id="couple-row">
            <div className="diya-wrap">
              <div className="diya-visual">
                <div className="diya-aura"></div>
                <div className="diya-flame"></div>
                <div className="diya-bowl"></div>
                <div className="diya-foot"></div>
              </div>
              <div className="couple-name">Tarun</div>
              <div className="couple-name-hi">तरुण</div>
            </div>
            <div className="rings-wrap">
              <div className="rings-box">
                <div className="ring-el"></div>
                <div className="ring-el"></div>
              </div>
              <div className="rings-label">Forever Bound</div>
            </div>
            <div className="diya-wrap">
              <div className="diya-visual">
                <div className="diya-aura"></div>
                <div className="diya-flame"></div>
                <div className="diya-bowl"></div>
                <div className="diya-foot"></div>
              </div>
              <div className="couple-name">Nidhi</div>
              <div className="couple-name-hi">निधि</div>
            </div>
          </div>
        </section>

        {/* 4. EVENTS */}
        <section className="section" id="scene-events">
          <div className="events-head" id="events-head">
            <div className="events-title">Auspicious Events</div>
            <div className="events-title-hi">मांगलिक कार्यक्रम</div>
            <div className="ornament"><span className="ornament-icon">✦</span></div>
          </div>
          <div className="events-grid" id="events-grid">
            <div className="event-card">
              <div className="ev-icon">🪔</div>
              <div className="ev-name">Lagan Sagai</div>
              <div className="ev-name-hi">लगन सगाई</div>
              <div className="ev-day">Saturday — शनिवार</div>
              <div className="ev-date">7th March</div>
              <div className="ev-time">5:00 PM Onwards</div>
              <div className="ev-venue">ग्राम लैहंडोला</div>
            </div>
            {/* User corrections below: Pratibhoj and Ghudchadi */}
            <div className="event-card">
              <div className="ev-icon">🍽️</div>
              <div className="ev-name">Pratibhoj</div>
              <div className="ev-name-hi">प्रीतिभोज</div>
              <div className="ev-day">Saturday — शनिवार</div>
              <div className="ev-date">7th March</div>
              <div className="ev-time">6:00 PM Onwards</div>
              <div className="ev-venue">ग्राम लैहंडोला</div>
            </div>
            <div className="event-card">
              <div className="ev-icon">💐</div>
              <div className="ev-name">Ghudchadi</div>
              <div className="ev-name-hi">घुड़चढ़ी</div>
              <div className="ev-day">Wednesday — बुधवार</div>
              <div className="ev-date">11th March</div>
              <div className="ev-time">4:00 PM Onwards</div>
              <div className="ev-venue">ग्राम लैहंडोला</div>
            </div>
            <div className="event-card">
              <div className="ev-icon">🐴</div>
              <div className="ev-name">Baraat</div>
              <div className="ev-name-hi">बारात प्रस्थान</div>
              <div className="ev-day">Wednesday — बुधवार</div>
              <div className="ev-date">11th March</div>
              <div className="ev-time">6:00 PM Onwards</div>
              <div className="ev-venue">ग्राम लैहंडोला</div>
            </div>
          </div>
        </section>

        {/* 5. COUNTDOWN */}
        <section className="section" id="scene-countdown">
          <div className="countdown-wrap" id="countdown-wrap">
            <div className="countdown-label">Counting Down To The Wedding</div>
            <div className="countdown-label-hi">विवाह तक शेष समय</div>
            <div className="countdown-boxes" id="countdown-boxes">
              <div className="countdown-unit">
                <div className="countdown-num">{timeLeft.days}</div>
                <div className="countdown-txt">Days</div>
              </div>
              <div className="countdown-unit">
                <div className="countdown-num">{timeLeft.hours}</div>
                <div className="countdown-txt">Hours</div>
              </div>
              <div className="countdown-unit">
                <div className="countdown-num">{timeLeft.mins}</div>
                <div className="countdown-txt">Minutes</div>
              </div>
              <div className="countdown-unit">
                <div className="countdown-num">{timeLeft.secs}</div>
                <div className="countdown-txt">Seconds</div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. MANDAP */}
        <section className="section" id="scene-mandap">
          <div className="mandap-wrap" id="mandap-wrap">
            <div className="mandap-title">The Sacred Mandap</div>
            <div className="mandap-title-hi">पवित्र मंडप</div>
            <div className="ornament"><span className="ornament-icon">🔥</span></div>
            <p className="mandap-body">
              Where two souls unite in the presence of<br />
              the sacred fire, under the blessings of the divine
            </p>
            <div className="mandap-verse">
              ॐ सप्तपदी — सात फेरों के साथ,<br />
              दो आत्माएं, एक हो जाती हैं।<br />
              अग्नि साक्षी, देव आशीर्वाद।
            </div>
          </div>
        </section>

        {/* 7. FAMILY */}
        <section className="section" id="scene-family">
          <div className="family-wrap" id="family-wrap">
            <div className="family-title">Hosted By</div>
            <div className="family-title-hi">प्रेषक</div>
            <div className="ornament"><span className="ornament-icon">❦</span></div>

            <div className="parents-block">
              <div className="parent-line">श्रीमती सुनीता एवं मा॰ राजेन्द्र चेची</div>
              <div className="parent-label">Parents of the Groom</div>
            </div>

            <div className="parents-block">
              <div className="parent-line" style={{ color: 'var(--marigold)' }}>श्रीमती सविता एवं श्री गजराज बैसोया</div>
              <div className="parent-label">Parents of the Bride</div>
              <div className="parent-detail">निवासी ग्राम अल्लीपुर (तिलोरी) जिला फरीदाबाद</div>
            </div>

            <div className="ornament"><span className="ornament-icon">◆</span></div>

            <div className="elders-label">Family Elders</div>
            <div className="elders-grid">
              <div className="elder-name">मा॰ राजेन्द्र चेची</div>
              <div className="elder-name">चौ॰ बिजेन्द्र चेची</div>
              <div className="elder-name">मा॰ बिरेन्द्र चेची</div>
              <div className="elder-name">सूबेदार मेजर देवेन्द्र चेची</div>
              <div className="elder-name">पहलवान अजयवीर सरपंच</div>
            </div>

            <div className="ornament"><span className="ornament-icon">◆</span></div>

            <div className="venue-line">ग्राम लैहंडोला, जिला फरीदाबाद (हरियाणा)</div>
            <div className="venue-line-en">Village Lehandola, District Faridabad, Haryana</div>

            <a href="https://maps.google.com/?q=Lehandola+Faridabad+Haryana" target="_blank" rel="noreferrer" className="map-link">📍 View on Map</a>

            <div className="contact-box">
              <div className="contact-label">Contact</div>
              <div className="contact-nums">
                <a href="tel:9810382306">9810382306</a> •
                <a href="tel:9899634494">9899634494</a> •
                <a href="tel:9310853574">9310853574</a><br />
                <a href="tel:8403896239">8403896239</a> •
                <a href="tel:9811879008">9811879008</a>
              </div>
            </div>
          </div>
        </section>

        {/* 8. BLESSING */}
        <section className="section" id="scene-blessing">
          <div className="blessing-wrap" id="blessing-wrap">
            <img src={`${import.meta.env.BASE_URL}assets/ganesha.png`} alt="Lord Ganesha" className="blessing-ganesha" />
            <div className="blessing-hi">
              श्री गणेश जी की कृपा से<br />
              आप सभी सादर आमंत्रित हैं
            </div>
            <p className="blessing-en">
              With the blessings of <span className="hl">Lord Ganesha</span><br />
              we invite you to join our celebration<br />
              of love, joy, and togetherness
            </p>
            <div className="ornament"><span className="ornament-icon">✦</span></div>
            <div className="blessing-names">Tarun & Nidhi</div>
          </div>
        </section>

        {/* 9. RSVP */}
        <section className="section" id="rsvp-section">
          <div className="rsvp-box">
            <div className="ornament"><span className="ornament-icon">✦</span></div>
            <div className="rsvp-title">We Await Your Presence</div>
            <div className="rsvp-title-hi">आपकी उपस्थिति हमारा सौभाग्य</div>
            <div className="ornament"><span className="ornament-icon">◆</span></div>
            <p className="rsvp-body">
              Your presence is the greatest gift.<br />
              Please let us know if you can join us.
            </p>
            <a href="https://wa.me/918527684249?text=Congratulations!%20We%20will%20be%20there%20for%20Tarun%20%26%20Nidhi%27s%20Wedding!%20%F0%9F%92%90"
              target="_blank" rel="noreferrer" className="rsvp-wa">
              ✉ &nbsp;Confirm via WhatsApp
            </a>
            <div className="ornament" style={{ marginTop: '2rem' }}><span className="ornament-icon">✦</span></div>
          </div>
        </section>

        <div className="footer">Made with ❤ for Tarun & Nidhi's Wedding</div>

      </div>
    </main>
  );
}

export default App;
