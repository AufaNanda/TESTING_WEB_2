import { useEffect, useRef, useState } from 'react';
import { asset } from '../lib/paths.js';
import './Projects.css';

/* Category system — ids drive both the filter bar and the badge coins. */
const CATEGORIES = [
  { id: 'data-analytics', label: 'Data Analytics', badge: asset('badges/data-analytics.png') },
  { id: 'data-science-ai', label: 'Data Science and AI', badge: asset('badges/data-science-ai.png') },
  { id: 'data-engineer', label: 'Data Engineer', badge: asset('badges/data-engineer.png') },
  { id: 'web-development', label: 'Web Development', badge: asset('badges/web-development.png') },
];
const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

const FILTERS = [{ id: 'all', label: 'All' }, ...CATEGORIES];

const PROJECTS = [
  {
    id: 'supermarket-sales',
    name: 'Supermarket Sales Dashboard',
    image: asset('projects/supermarket-sales.png'),
    caption: 'Sales analytics & performance insights',
    categories: ['data-analytics'],
    href: asset('projects/supermarket-sales.pdf'),
  },
  {
    id: 'bike',
    name: 'Exploratory Data Analysis: Sales Bike',
    image: asset('projects/bike.jpg'),
    caption: 'Rental demand forecasting',
    categories: ['data-analytics'],
    href: 'https://github.com/AufaNanda/Exploratory-data-analysis-Sales-Bike',
  },
  {
    id: 'heart-disease',
    name: 'Classification of Heart Disease Indicator',
    image: asset('projects/heart-disease.jpg'),
    caption: 'Clinical risk classification',
    categories: ['data-science-ai'],
    href: 'https://github.com/AufaNanda/Classification_indicators_of_Heart_Disease',
  },
  {
    id: 'sales-coffee',
    name: 'Identifying Target Customers for Starbucks',
    image: asset('projects/sales-coffee.png'),
    caption: 'Sales performance dashboard',
    categories: ['data-science-ai'],
    href: 'https://github.com/AufaNanda/Identifying-Target-Customers-for-Starbucks',
  },
  {
    id: 'hotel',
    name: 'Profiling Destinasi Wisata',
    image: asset('projects/hotel.jpg'),
    caption: 'Cancellation & revenue study',
    categories: ['data-science-ai'],
    href: 'https://github.com/AufaNanda/Profiling-Destinasi-Wisata-di-Indonesia',
  },
  {
    id: 'weather',
    name: 'Weather Predictions in the Asian Region',
    image: asset('projects/weather.jpg'),
    caption: 'Automated ETL & live dashboard',
    categories: ['data-science-ai'],
    href: 'https://github.com/AufaNanda/Weather-Predictions-In-The-Asian-Region',
  },
  {
    id: 'honor-of-kings',
    name: 'Honor of Kings Sentiment Analysis',
    image: asset('projects/honor-of-kings.png'),
    caption: 'NLP sentiment analysis',
    categories: ['data-science-ai'],
    href: 'https://github.com/AufaNanda/Honor-Of-King---Sentiment-Analysis',
  },
];

export default function Projects() {
  const sectionRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const shown = PROJECTS.filter(
    (p) => filter === 'all' || p.categories.includes(filter)
  );

  return (
    <section
      id="projects"
      className={'pj' + (revealed ? ' is-revealed' : '')}
      ref={sectionRef}
      aria-labelledby="pj-title"
    >
      <header className="pj__intro">
        <h2 className="pj__title" id="pj-title">Projects</h2>
        <div className="pj__rule" aria-hidden="true">
          <span className="pj__rule-line" />
          <span className="pj__rule-mark" />
          <span className="pj__rule-line" />
        </div>
      </header>

      <div className="pj__filters" role="group" aria-label="Filter projects by category">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={'pj__pill' + (filter === f.id ? ' is-active' : '')}
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="pj__empty">No projects in this category yet.</p>
      ) : (
        <ul className="pj__grid">
          {shown.map((p, i) => (
            <li key={p.id} className="pj__cell" style={{ '--i': i }}>
              <a
                className="pj__card"
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="pj__wave">
                  <span className="pj__banner">
                    <img className="pj__img" src={p.image} alt="" loading="lazy" draggable="false" />
                    <span className="pj__scrim" aria-hidden="true" />

                    <span className="pj__badges">
                      {p.categories.slice(0, 4).map((cid) => (
                        <span className="pj__flag" key={cid} title={CAT[cid].label}>
                          <img
                            className="pj__flag-icon"
                            src={CAT[cid].badge}
                            alt={CAT[cid].label}
                            draggable="false"
                          />
                        </span>
                      ))}
                    </span>

                    <span className="pj__reveal">{p.caption}</span>
                  </span>

                  <span className="pj__info">
                    <span className="pj__name">{p.name}</span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
