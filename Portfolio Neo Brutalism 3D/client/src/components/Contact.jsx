import { useState } from 'react';
import { api } from '../api.js';
import { useLang } from '../hooks/useLang.jsx';
import { profile } from '../config.js';
import { BrutalButton, BrutalCard, Reveal, SectionTitle } from './ui.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | ok | fail

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = t('contact.errName');
    if (!EMAIL_RE.test(form.email.trim())) e.email = t('contact.errEmail');
    if (form.message.trim().length < 10) e.message = t('contact.errMessage');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      await api.post('/contact', form);
      setStatus('ok');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('fail');
    }
  };

  const Field = ({ name, label, type = 'text', area }) => {
    const Tag = area ? 'textarea' : 'input';
    return (
      <div className="field">
        <label htmlFor={`c-${name}`}>{label}</label>
        <Tag
          id={`c-${name}`}
          name={name}
          type={area ? undefined : type}
          value={form[name]}
          onChange={onChange}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `c-${name}-err` : undefined}
          autoComplete={name === 'name' ? 'name' : name === 'email' ? 'email' : 'off'}
        />
        {errors[name] && (
          <span className="err" id={`c-${name}-err`} role="alert">
            {errors[name]}
          </span>
        )}
      </div>
    );
  };

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container">
        <SectionTitle id="contact-title" color="pink">
          {t('contact.title')}
        </SectionTitle>
        <div className="contact__grid">
          <Reveal x={-40} y={0}>
            <BrutalCard color="mint" rotate={-1.5}>
              <p className="contact__intro">{t('contact.intro')}</p>
              <p style={{ marginBottom: 0, fontFamily: 'var(--f-mono)', fontWeight: 700 }}>
                ✉ {profile.email}
              </p>
            </BrutalCard>
          </Reveal>

          <Reveal x={40} y={0}>
            <BrutalCard as="form" onSubmit={onSubmit} noValidate>
              {Field({ name: 'name', label: t('contact.name') })}
              {Field({ name: 'email', label: t('contact.email'), type: 'email' })}
              {Field({ name: 'message', label: t('contact.message'), area: true })}
              <BrutalButton variant="yellow" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? t('contact.sending') : `➤ ${t('contact.send')}`}
              </BrutalButton>
              {status === 'ok' && <p className="alert alert--ok" role="status">{t('contact.success')}</p>}
              {status === 'fail' && <p className="alert alert--bad" role="alert">{t('contact.error')}</p>}
            </BrutalCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
