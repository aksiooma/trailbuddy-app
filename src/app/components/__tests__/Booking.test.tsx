import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BikeSelector from '../BikeSelector'; // Adjust the import path as needed


// Mocking useFetchBikes and the props functions
jest.mock('../hooks/useFetchBikes', () => ({
  useFetchBikes: () => [
    { id: 'bike1', name: 'Mountain Bike', stock: 1, price: 100, specs: 'Specs1', Small: 1, Medium: 1, Large: 1, sizing: "LMS" },
    { id: 'bike2', name: 'Road Bike', stock: 1, price: 100, specs: 'Specs2', Small: 1, Medium: 1, Large: 1, sizing: "LMS"}
  ]
}));

const mockOnSelectBike = jest.fn();
const mockOnSizeSelect = jest.fn();

describe('BikeSelector', () => {
  test('allows a user to select a bike', () => {
    const { getByText } = render(<BikeSelector onSelectBike={mockOnSelectBike} onSizeSelect={mockOnSizeSelect} selectedBike={null} selectedSize={null} />);

    const bikeElement = getByText('Mountain Bike');
    fireEvent.click(bikeElement);

    expect(mockOnSelectBike).toHaveBeenCalledWith(expect.objectContaining({
      id: 'bike1', 
      name: 'Mountain Bike', 
      price: 100, 
      specs: 'Specs1', 
      Small: 1, 
      Medium: 1, 
      Large: 1,
      stock: 1,
      sizing:"LMS"
    }));
  });

  test('allows a user to select a size', () => {
    // Mock selectedBike with all required properties
    const selectedBikeMock = {
      id: 'bike1', 
      name: 'Mountain Bike', 
      price: 100, 
      specs: 'Specs1', 
      Small: 1, 
      Medium: 1, 
      Large: 1,
      stock: 1,
      sizing:"LMS"
    };

    const { getByText } = render(<BikeSelector onSelectBike={mockOnSelectBike} onSizeSelect={mockOnSizeSelect} selectedBike={selectedBikeMock} selectedSize={null} />);

    const sizeButton = getByText('Medium');
    fireEvent.click(sizeButton);

    expect(mockOnSizeSelect).toHaveBeenCalledWith('Medium');
  });
});
