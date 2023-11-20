
// BookingForm.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BookingForm from "../BookingForm";

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockReturnValue({
    // Mock the methods
  }),
 
}));


describe('BookingForm XSS Protection', () => {
  test('input fields should not execute script', () => {
    const { getByPlaceholderText, container } = render(<BookingForm />);
    const nameInput = getByPlaceholderText("Email") as HTMLInputElement;
    const emailInput = getByPlaceholderText("Password") as HTMLInputElement;

    // Insert potentially malicious script
    fireEvent.change(nameInput, { target: { value: '"><script>alert("XSS")</script>' } });
    fireEvent.change(emailInput, { target: { value: '"><script>alert("XSS")</script>' } });

    // Expect the inputs to contain the exact value set
    expect(nameInput.value).toBe('"><script>alert("XSS")</script>');
    expect(emailInput.value).toBe('"><script>alert("XSS")</script>');

    // Additional checks:
   // Assert no script tags are in the output
    const scriptTags = container.querySelectorAll('script');
    expect(scriptTags.length).toBe(0);

  });
});

