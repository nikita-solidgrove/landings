import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronRight } from 'lucide-react';
import { FAQ } from './content';

/**
 * The FAQ as a TV settings menu: questions on the left with their short value, the focused one's
 * answer on the right (under the question on phones). One focus ring glides between the rows.
 */
export function SettingsFaq() {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const box = list.current;
    if (!box) return;
    const place = () => {
      const button = buttons.current[active];
      const answer = box.querySelector<HTMLElement>(`#smr-faq-a-${active}`);
      if (!button || !ring.current) return;
      const origin = box.getBoundingClientRect();
      const b = button.getBoundingClientRect();
      let bottom = b.bottom;
      // On phones the answer opens right under its question: the ring takes both in.
      if (answer) {
        const a = answer.getBoundingClientRect();
        if (Math.abs(a.left - b.left) < 2 && a.top >= b.bottom - 1) bottom = a.bottom;
      }
      ring.current.style.transform = `translate(${b.left - origin.left}px, ${b.top - origin.top}px)`;
      ring.current.style.width = `${b.width}px`;
      ring.current.style.height = `${bottom - b.top}px`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(box);
    return () => observer.disconnect();
  }, [active]);

  const move = (event: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = FAQ.length - 1;
    const next =
      event.key === 'ArrowDown' ? Math.min(last, i + 1)
      : event.key === 'ArrowUp' ? Math.max(0, i - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <div className='smr-settings' data-reveal=''>
      <div className='smr-settings-bar' aria-hidden='true'>
        <span>Settings</span>
        <span>Questions</span>
      </div>
      <div className='smr-settings-list' ref={list}>
        <span className='smr-settings-ring' ref={ring} aria-hidden='true' />
        {FAQ.map((item, i) => (
          <div className='smr-settings-item' key={item.question} data-active={i === active}>
            <button
              ref={(el) => {
                buttons.current[i] = el;
              }}
              id={`smr-faq-q-${i}`}
              type='button'
              className='smr-settings-q'
              aria-expanded={i === active}
              aria-controls={`smr-faq-a-${i}`}
              onClick={() => setActive(i)}
              onFocus={() => setActive(i)}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') setActive(i);
              }}
              onKeyDown={(event) => move(event, i)}
            >
              <span className='smr-settings-text'>{item.question}</span>
              <span className='smr-settings-value'>{item.value}</span>
              <ChevronRight aria-hidden='true' />
            </button>
            <div
              id={`smr-faq-a-${i}`}
              className='smr-settings-a'
              role='region'
              aria-labelledby={`smr-faq-q-${i}`}
              hidden={i !== active}
            >
              <p className='smr-settings-a-title'>{item.question}</p>
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
      <p className='smr-settings-hint' aria-hidden='true'>
        <kbd>↑</kbd>
        <kbd>↓</kbd> Move
        <kbd>↵</kbd> Select
      </p>
    </div>
  );
}
