
// BookingForm.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BookingForm from '../src/app/components/BookingForm';

describe('BookingForm XSS Protection', () => {
  test('input fields should not execute script', () => {
    const { getByPlaceholderText } = render(<BookingForm />);
    const nameInput = getByPlaceholderText("Full Name") as HTMLInputElement;
    const emailInput = getByPlaceholderText("Email") as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: '"><script>alert("XSS")</script>' } });
    fireEvent.change(emailInput, { target: { value: '"><script>alert("XSS")</script>' } });

    // Testaa, ettei syötekenttä suorita skriptiä
    expect(nameInput.value).not.toContain('<script>');
    expect(emailInput.value).not.toContain('<script>');
  });
});