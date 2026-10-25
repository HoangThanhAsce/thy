"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";

/** option rows: label and top offset inside the 583×928 source form */
const ATTENDANCE = [
  ["Yes, I’ll be there!", 196],
  ["Sorry, can’t make it", 272],
] as const;
const GUESTS = [
  ["Just me", 418],
  ["Me +1", 490],
  ["Me +2 or more", 562],
] as const;

const rowStyle = (top: number) => ({ "--top": top }) as CSSProperties;

/**
 * Local rebuild of the Canva Forms element embedded in the source. Submissions
 * stay in the browser: no data is sent anywhere.
 */
export function RsvpForm() {
  const id = useId();
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<string | null>(null);
  const [guests, setGuests] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string>("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setStatus("Please enter your name.");
      return;
    }
    if (!attending) {
      setStatus("Please let us know if you can attend.");
      return;
    }
    setStatus(`Thank you, ${name.trim()}! Your RSVP was saved on this device only.`);
  };

  return (
    <form className="ln-rsvp" onSubmit={onSubmit} noValidate>
      <div className="ln-rsvp-card">
        <label className="ln-rsvp-label ln-rsvp-name-label" htmlFor={`${id}-name`}>
          Your Name
        </label>
        <input
          id={`${id}-name`}
          className="ln-rsvp-input ln-rsvp-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <fieldset className="ln-rsvp-group ln-rsvp-attending">
          <legend className="ln-rsvp-label">Will you be attending?</legend>
          {ATTENDANCE.map(([option, top]) => (
            <label
              key={option}
              className="ln-rsvp-option"
              data-group="attending"
              data-checked={attending === option ? "" : undefined}
              style={rowStyle(top)}
            >
              <input
                type="radio"
                name={`${id}-attending`}
                value={option}
                checked={attending === option}
                onChange={() => setAttending(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="ln-rsvp-group ln-rsvp-guests">
          <legend className="ln-rsvp-label">Number of Guests (including you)</legend>
          {GUESTS.map(([option, top]) => (
            <label
              key={option}
              className="ln-rsvp-option"
              data-group="guests"
              data-checked={guests === option ? "" : undefined}
              style={rowStyle(top)}
            >
              <input
                type="radio"
                name={`${id}-guests`}
                value={option}
                checked={guests === option}
                onChange={() => setGuests(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>

        <label className="ln-rsvp-label ln-rsvp-message-label" htmlFor={`${id}-message`}>
          Leave a message for the graduate (optional)
        </label>
        <input
          id={`${id}-message`}
          className="ln-rsvp-input ln-rsvp-message"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button className="ln-rsvp-submit" type="submit">
          Submit RSVP
        </button>
        <p className="ln-rsvp-status" role="status">
          {status}
        </p>
      </div>
    </form>
  );
}
