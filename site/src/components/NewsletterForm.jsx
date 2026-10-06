import { useId, useState } from 'react';
import { site } from '../data/site';

// Single input row + velvet pill. Label above the field, helper below, one-line success state.
export default function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | error | done

  const onSubmit = async e => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState('error');
      return;
    }
    if (site.newsletterAction) {
      try {
        await fetch(site.newsletterAction, {
          method: 'POST',
          mode: 'no-cors',
          body: new URLSearchParams({ email: email.trim() })
        });
      } catch {
        /* the list service answers opaquely in no-cors mode */
      }
    }
    setState('done');
  };

  if (state === 'done') {
    return (
      <p className="lead newsletter__done" role="status">
        You're on the list. The next concert date comes to your inbox first.
      </p>
    );
  }

  return (
    <form className="field newsletter" noValidate onSubmit={onSubmit}>
      <label className="field__label" htmlFor={`${id}-email`}>
        Email
      </label>
      <div className="input-row">
        <input
          className="input"
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          aria-invalid={state === 'error'}
          aria-describedby={`${id}-help${state === 'error' ? ` ${id}-error` : ''}`}
          onChange={e => {
            setEmail(e.target.value);
            if (state === 'error') setState('idle');
          }}
        />
        <button className="btn btn--primary" type="submit">
          Join the list
        </button>
      </div>
      {state === 'error' && (
        <span className="field__error" id={`${id}-error`} role="alert">
          Add an email so we can reach you.
        </span>
      )}
      <span className="body-sm muted" id={`${id}-help`}>
        Concert dates, first. One email a month at most.
      </span>
    </form>
  );
}
